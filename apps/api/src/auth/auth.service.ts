import { createHash, randomBytes } from 'node:crypto';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import type { Response } from 'express';
import type { EnvironmentVariables } from '../config/env.validation';
import { extractIp } from '../common/utils/ip.utils';
import { PrismaService } from '../prisma/prisma.service';
import type { AdminProfile, JwtAccessPayload } from './auth.types';
import type { ChangePasswordDto } from './dto/change-password.dto';
import type { LoginDto } from './dto/login.dto';

const ACCESS_COOKIE = 'rw_at';
const REFRESH_COOKIE = 'rw_rt';
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  private cookieOptions(path = '/'): {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'lax';
    domain: string;
    path: string;
  } {
    return {
      httpOnly: true,
      secure: this.config.get('COOKIE_SECURE', { infer: true }),
      sameSite: 'lax',
      domain: this.config.get('COOKIE_DOMAIN', { infer: true }),
      path,
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async isLoginBlocked(ip: string): Promise<boolean> {
    const since = new Date(Date.now() - LOGIN_WINDOW_MS);
    const failures = await this.prisma.adminLoginAttempt.count({
      where: {
        ip,
        success: false,
        createdAt: { gte: since },
      },
    });
    return failures >= MAX_LOGIN_ATTEMPTS;
  }

  private async logAttempt(
    email: string,
    ip: string,
    success: boolean,
  ): Promise<void> {
    await this.prisma.adminLoginAttempt.create({
      data: { email, ip, success },
    });
  }

  private signAccess(user: { id: string; email: string }): string {
    const payload: JwtAccessPayload = {
      sub: user.id,
      email: user.email,
      type: 'access',
    };
    return this.jwt.sign(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET', { infer: true }),
      expiresIn: '15m',
    });
  }

  private async createRefreshToken(
    userId: string,
    ip: string,
    userAgent: string | undefined,
  ): Promise<string> {
    const raw = randomBytes(48).toString('base64url');
    const hash = this.hashToken(raw);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hash,
        expiresAt,
        ip,
        userAgent: userAgent?.slice(0, 255) ?? null,
      },
    });
    return raw;
  }

  setAuthCookies(res: Response, access: string, refresh: string): void {
    res.cookie(ACCESS_COOKIE, access, {
      ...this.cookieOptions('/'),
      maxAge: 15 * 60 * 1000,
    });
    res.cookie(REFRESH_COOKIE, refresh, {
      ...this.cookieOptions('/v1/auth'),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  clearAuthCookies(res: Response): void {
    const base = this.cookieOptions('/');
    res.clearCookie(ACCESS_COOKIE, base);
    res.clearCookie(REFRESH_COOKIE, { ...base, path: '/v1/auth' });
  }

  async login(
    dto: LoginDto,
    ip: string,
    userAgent: string | undefined,
    res: Response,
  ): Promise<AdminProfile> {
    if (await this.isLoginBlocked(ip)) {
      throw new ForbiddenException(
        'Trop de tentatives. Réessayez dans 15 minutes.',
      );
    }

    const user = await this.prisma.adminUser.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    const invalid = async (): Promise<never> => {
      await this.logAttempt(dto.email, ip, false);
      throw new UnauthorizedException('E-mail ou mot de passe incorrect.');
    };

    if (!user) {
      return invalid();
    }

    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) {
      return invalid();
    }

    await this.logAttempt(dto.email, ip, true);
    await this.prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const access = this.signAccess(user);
    const refresh = await this.createRefreshToken(user.id, ip, userAgent);
    this.setAuthCookies(res, access, refresh);

    return this.toProfile(user);
  }

  async refresh(
    rawRefresh: string | undefined,
    ip: string,
    userAgent: string | undefined,
    res: Response,
  ): Promise<AdminProfile> {
    if (!rawRefresh) {
      throw new UnauthorizedException('Session expirée.');
    }
    const hash = this.hashToken(rawRefresh);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash: hash },
      include: { user: true },
    });

    if (!stored) {
      throw new UnauthorizedException('Session expirée.');
    }

    if (stored.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      this.clearAuthCookies(res);
      throw new UnauthorizedException('Session invalidée.');
    }

    if (stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expirée.');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const access = this.signAccess(stored.user);
    const refresh = await this.createRefreshToken(stored.userId, ip, userAgent);
    this.setAuthCookies(res, access, refresh);

    return this.toProfile(stored.user);
  }

  async logout(rawRefresh: string | undefined, res: Response): Promise<void> {
    if (rawRefresh) {
      const hash = this.hashToken(rawRefresh);
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash: hash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    this.clearAuthCookies(res);
  }

  async me(adminId: string): Promise<AdminProfile> {
    const user = await this.prisma.adminUser.findUniqueOrThrow({
      where: { id: adminId },
    });
    return this.toProfile(user);
  }

  async changePassword(
    adminId: string,
    dto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.prisma.adminUser.findUniqueOrThrow({
      where: { id: adminId },
    });
    const ok = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!ok) {
      throw new UnauthorizedException('Mot de passe actuel incorrect.');
    }
    const passwordHash = await argon2.hash(dto.newPassword);
    await this.prisma.adminUser.update({
      where: { id: adminId },
      data: { passwordHash },
    });
    await this.prisma.refreshToken.updateMany({
      where: { userId: adminId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private toProfile(user: {
    id: string;
    email: string;
    name: string;
    lastLoginAt: Date | null;
  }): AdminProfile {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    };
  }

  static clientIp(req: {
    headers: Record<string, string | string[] | undefined>;
    socket: { remoteAddress?: string };
  }): string {
    return extractIp(req as Parameters<typeof extractIp>[0], false);
  }
}
