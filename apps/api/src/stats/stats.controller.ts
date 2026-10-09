import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StatsQueryDto } from './dto/stats-query.dto';
import { StatsService } from './stats.service';

@ApiTags('admin-stats')
@Controller('v1/admin/stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get('overview')
  overview(@Query() query: StatsQueryDto) {
    return this.stats.overview(query);
  }

  @Get('timeseries')
  timeseries(
    @Query() query: StatsQueryDto,
    @Query('interval') interval = 'day',
  ) {
    return this.stats.timeseries(query, interval);
  }

  @Get('live')
  live(@Query() query: StatsQueryDto) {
    return this.stats.live(query);
  }

  @Get('geo')
  geo(@Query() query: StatsQueryDto) {
    return this.stats.geo(query, query.level ?? 'country');
  }

  @Get('devices')
  devices(@Query() query: StatsQueryDto) {
    return this.stats.devices(query);
  }

  @Get('sources')
  sources(@Query() query: StatsQueryDto) {
    return this.stats.sources(query);
  }

  @Get('clicks')
  clicks(@Query() query: StatsQueryDto) {
    return this.stats.clicks(query);
  }

  @Get('sections')
  sections(@Query() query: StatsQueryDto) {
    return this.stats.sections(query);
  }

  @Get('scroll')
  scroll(@Query() query: StatsQueryDto) {
    return this.stats.scroll(query);
  }

  @Get('exits')
  exits(@Query() query: StatsQueryDto) {
    return this.stats.exits(query);
  }

  @Get('funnel')
  funnel(@Query() query: StatsQueryDto) {
    return this.stats.funnel(query);
  }

  @Get('hours')
  hours(@Query() query: StatsQueryDto) {
    return this.stats.hours(query);
  }

  @Get('durations')
  durations(@Query() query: StatsQueryDto) {
    return this.stats.durations(query);
  }
}
