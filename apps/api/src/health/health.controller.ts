import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GeoService } from '../geo/geo.service';
import { PrismaService } from '../prisma/prisma.service';

export type HealthResponse = {
  status: 'ok';
  db: 'ok' | 'error';
  geo: 'ok' | 'missing';
};

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geo: GeoService,
  ) {}

  @Get()
  @ApiOkResponse({
    description: 'État du service',
    schema: {
      example: { status: 'ok', db: 'ok', geo: 'missing' },
    },
  })
  async getHealth(): Promise<HealthResponse> {
    const dbOk = await this.prisma.ping();
    return {
      status: 'ok',
      db: dbOk ? 'ok' : 'error',
      geo: this.geo.getStatus(),
    };
  }
}
