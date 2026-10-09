import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { extractIp } from '../common/utils/ip.utils';
import type { EnvironmentVariables } from '../config/env.validation';
import { AuthService } from './auth.service';
import { CurrentAdmin } from './current-admin.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  private ip(req: Request): string {
    return extractIp(req, this.config.get('TRUST_PROXY', { infer: true }));
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.auth.login(
      dto,
      this.ip(req),
      req.headers['user-agent'],
      res,
    );
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const raw = req.cookies?.['rw_rt'] as string | undefined;
    return this.auth.refresh(raw, this.ip(req), req.headers['user-agent'], res);
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.['rw_rt'] as string | undefined;
    await this.auth.logout(raw, res);
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentAdmin() admin: { sub: string }) {
    return this.auth.me(admin.sub);
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  async password(
    @CurrentAdmin() admin: { sub: string },
    @Body() dto: ChangePasswordDto,
  ) {
    await this.auth.changePassword(admin.sub, dto);
    return { ok: true };
  }
}
