import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CsrfGuard } from '../auth/csrf.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AppSettings } from './settings-cache.service';
import { SettingsService } from './settings.service';

@ApiTags('admin-settings')
@Controller('v1/admin')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get('settings')
  get() {
    return this.settings.getAll();
  }

  @Put('settings')
  @UseGuards(CsrfGuard)
  put(@Body() body: Partial<AppSettings>) {
    return this.settings.update(body);
  }

  @Post('settings/exclude-my-ip')
  @UseGuards(CsrfGuard)
  excludeIp(@Req() req: Request) {
    return this.settings.excludeMyIp(req);
  }

  @Post('maintenance/purge')
  @UseGuards(CsrfGuard)
  purge() {
    return this.settings.purgeNow();
  }
}
