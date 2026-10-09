import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { LeadStatus } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { CsrfGuard } from '../auth/csrf.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { extractIp } from '../common/utils/ip.utils';
import type { EnvironmentVariables } from '../config/env.validation';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadsService } from './leads.service';

@ApiTags('leads')
@Controller()
export class LeadsController {
  constructor(
    private readonly leads: LeadsService,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  @Post('v1/leads')
  @Throttle({ default: { limit: 5, ttl: 600_000 } })
  create(@Body() dto: CreateLeadDto, @Req() req: Request) {
    const ip = extractIp(req, this.config.get('TRUST_PROXY', { infer: true }));
    return this.leads.createPublic(dto, ip);
  }

  @Get('v1/admin/leads')
  @UseGuards(JwtAuthGuard)
  list(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
    @Query('status') status?: LeadStatus,
    @Query('q') q?: string,
  ) {
    const p = Math.max(1, Number(page) || 1);
    const ps = Math.min(100, Math.max(1, Number(pageSize) || 20));
    return this.leads.list({ page: p, pageSize: ps, status, q });
  }

  @Get('v1/admin/leads/export.csv')
  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportCsv(@Res() res: Response, @Query('status') status?: LeadStatus) {
    const csv = await this.leads.exportCsv(status);
    res.send(csv);
  }

  @Get('v1/admin/leads/:id')
  @UseGuards(JwtAuthGuard)
  get(@Param('id') id: string) {
    return this.leads.getById(id);
  }

  @Patch('v1/admin/leads/:id')
  @UseGuards(JwtAuthGuard, CsrfGuard)
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leads.update(id, dto);
  }

  @Delete('v1/admin/leads/:id')
  @UseGuards(JwtAuthGuard, CsrfGuard)
  async remove(@Param('id') id: string) {
    await this.leads.remove(id);
    return { ok: true };
  }
}
