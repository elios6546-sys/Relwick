import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { extractIp } from '../common/utils/ip.utils';
import type { EnvironmentVariables } from '../config/env.validation';
import { CollectPayloadDto } from './collect.dto';
import { CollectService } from './collect.service';

@ApiTags('collect')
@Controller('v1/collect')
export class CollectController {
  constructor(
    private readonly collect: CollectService,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  @Post()
  @HttpCode(204)
  @Throttle({ default: { limit: 120, ttl: 60_000 } })
  async ingest(@Req() req: Request, @Body() body: CollectPayloadDto | string): Promise<void> {
    const raw: unknown =
      typeof body === 'string' ? (JSON.parse(body) as unknown) : body;
    const parsed = plainToInstance(CollectPayloadDto, raw);
    const errors = await validate(parsed, { whitelist: true, forbidNonWhitelisted: true });
    if (errors.length > 0) {
      return;
    }
    const ip = extractIp(req, this.config.get('TRUST_PROXY', { infer: true }));
    const ua = req.headers['user-agent'] ?? '';
    try {
      await this.collect.process(parsed, ip, ua);
    } catch (err) {
      // Ne jamais casser le site — journaliser seulement
      console.error('Collect error', err);
    }
  }
}
