import { Test, TestingModule } from '@nestjs/testing';
import { GeoService } from '../geo/geo.service';
import { PrismaService } from '../prisma/prisma.service';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: { ping: async () => true },
        },
        {
          provide: GeoService,
          useValue: { getStatus: () => 'missing' as const },
        },
      ],
    }).compile();

    controller = module.get(HealthController);
  });

  it('retourne le statut db et geo', async () => {
    await expect(controller.getHealth()).resolves.toEqual({
      status: 'ok',
      db: 'ok',
      geo: 'missing',
    });
  });
});
