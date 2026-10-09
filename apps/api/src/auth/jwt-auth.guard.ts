import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { EnvironmentVariables } from '../config/env.validation';
import type { JwtAccessPayload } from './auth.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request & { user?: JwtAccessPayload }>();
    const token = req.cookies?.['rw_at'] as string | undefined;
    if (!token) {
      throw new UnauthorizedException('Authentification requise.');
    }
    try {
      const payload = this.jwt.verify<JwtAccessPayload>(token, {
        secret: this.config.get('JWT_ACCESS_SECRET', { infer: true }),
      });
      if (payload.type !== 'access') {
        throw new UnauthorizedException('Authentification requise.');
      }
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Authentification requise.');
    }
  }
}
