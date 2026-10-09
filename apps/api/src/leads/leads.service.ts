import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventType, LeadStatus, Prisma } from '@prisma/client';
import { csvWithBom } from '../common/utils/csv.utils';
import { GeoService } from '../geo/geo.service';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateLeadDto } from './dto/create-lead.dto';
import type { UpdateLeadDto } from './dto/update-lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geo: GeoService,
  ) {}

  async createPublic(dto: CreateLeadDto, ip: string): Promise<{ id: string }> {
    if (dto.website && dto.website.length > 0) {
      throw new BadRequestException('Requête refusée.');
    }
    if (!dto.consent) {
      throw new BadRequestException('Le consentement est obligatoire.');
    }

    const geo = this.geo.lookup(ip);

    const lead = await this.prisma.$transaction(async (tx) => {
      const created = await tx.lead.create({
        data: {
          fullName: dto.fullName.trim(),
          phone: dto.phone.trim(),
          email: dto.email?.trim() || null,
          projectType: dto.projectType,
          callSlot: dto.callSlot,
          message: dto.message?.trim() || null,
          consent: dto.consent,
          visitorId: dto.visitorId ?? null,
          sessionId: dto.sessionId ?? null,
          ip,
          city: geo?.city ?? null,
        },
      });

      if (dto.sessionId) {
        await tx.session.updateMany({
          where: { id: dto.sessionId },
          data: { converted: true },
        });
        await tx.event.create({
          data: {
            sessionId: dto.sessionId,
            type: EventType.FORM_SUBMIT,
            value: null,
            meta: { leadId: created.id },
            occurredAt: new Date(),
          },
        });
      }

      return created;
    });

    return { id: lead.id };
  }

  async list(params: {
    page: number;
    pageSize: number;
    status?: LeadStatus;
    q?: string;
  }) {
    const where: Prisma.LeadWhereInput = {};
    if (params.status) where.status = params.status;
    if (params.q?.trim()) {
      const q = params.q.trim();
      where.OR = [
        { fullName: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
        { city: { contains: q } },
      ];
    }
    const [total, items] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
    ]);
    return { total, page: params.page, pageSize: params.pageSize, items };
  }

  async getById(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        session: {
          include: {
            pageViews: { orderBy: { enteredAt: 'asc' } },
            events: { orderBy: { occurredAt: 'asc' }, take: 200 },
          },
        },
      },
    });
    if (!lead) throw new NotFoundException('Demande introuvable.');
    return lead;
  }

  async update(id: string, dto: UpdateLeadDto) {
    await this.getById(id);
    return this.prisma.lead.update({
      where: { id },
      data: {
        status: dto.status,
        notes: dto.notes,
        contactedAt: dto.contactedAt ? new Date(dto.contactedAt) : undefined,
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.getById(id);
    await this.prisma.lead.delete({ where: { id } });
  }

  async exportCsv(status?: LeadStatus): Promise<string> {
    const where: Prisma.LeadWhereInput = status ? { status } : {};
    const leads = await this.prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return csvWithBom(
      [
        'id',
        'createdAt',
        'fullName',
        'phone',
        'email',
        'projectType',
        'callSlot',
        'status',
        'city',
        'ip',
      ],
      leads.map((l) => [
        l.id,
        l.createdAt.toISOString(),
        l.fullName,
        l.phone,
        l.email ?? '',
        l.projectType,
        l.callSlot,
        l.status,
        l.city ?? '',
        l.ip ?? '',
      ]),
    );
  }
}
