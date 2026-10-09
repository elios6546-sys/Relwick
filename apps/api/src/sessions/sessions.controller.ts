import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StatsQueryDto } from '../stats/dto/stats-query.dto';
import { SessionsService } from './sessions.service';

@ApiTags('admin-sessions')
@Controller('v1/admin')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  @Get('sessions')
  list(@Query() query: StatsQueryDto & Record<string, string>) {
    return this.sessions.list({
      ...query,
      page: Number(query.page) || 1,
      pageSize: Number(query.pageSize) || 20,
      q: query.q,
      minDuration: query.minDuration ? Number(query.minDuration) : undefined,
      maxDuration: query.maxDuration ? Number(query.maxDuration) : undefined,
      converted:
        query.converted === 'true'
          ? true
          : query.converted === 'false'
            ? false
            : undefined,
      isBounce:
        query.isBounce === 'true'
          ? true
          : query.isBounce === 'false'
            ? false
            : undefined,
      sort: query.sort,
      order: query.order === 'asc' ? 'asc' : 'desc',
    });
  }

  @Get('sessions/export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportCsv(
    @Query() query: StatsQueryDto & Record<string, string>,
    @Res() res: Response,
  ) {
    const csv = await this.sessions.exportCsv({
      ...query,
      q: query.q,
      minDuration: query.minDuration ? Number(query.minDuration) : undefined,
      maxDuration: query.maxDuration ? Number(query.maxDuration) : undefined,
    });
    res.send(csv);
  }

  @Get('sessions/:id')
  detail(@Param('id') id: string) {
    return this.sessions.detail(id);
  }

  @Get('visitors/:id')
  visitor(@Param('id') id: string) {
    return this.sessions.visitorProfile(id);
  }
}
