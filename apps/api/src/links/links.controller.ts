import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CsrfGuard } from '../auth/csrf.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StatsQueryDto } from '../stats/dto/stats-query.dto';
import { CreateShareLinkDto, UpdateShareLinkDto } from './dto/share-link.dto';
import { LinksService } from './links.service';

@ApiTags('links')
@Controller()
export class LinksController {
  constructor(private readonly links: LinksService) {}

  /** Résolution publique d'un lien court (appelée par la route /l/:slug du site). */
  @Post('v1/links/:slug/resolve')
  @Throttle({ default: { limit: 120, ttl: 60_000 } })
  async resolve(@Param('slug') slug: string) {
    const result = await this.links.resolve(slug);
    if (!result) throw new NotFoundException('Lien introuvable.');
    return result;
  }

  @Get('v1/admin/links')
  @UseGuards(JwtAuthGuard)
  list(@Query() query: StatsQueryDto) {
    return this.links.list(query);
  }

  @Get('v1/admin/links/:id')
  @UseGuards(JwtAuthGuard)
  detail(@Param('id') id: string, @Query() query: StatsQueryDto) {
    return this.links.detail(id, query);
  }

  @Post('v1/admin/links')
  @UseGuards(JwtAuthGuard, CsrfGuard)
  create(@Body() dto: CreateShareLinkDto) {
    return this.links.create(dto);
  }

  @Patch('v1/admin/links/:id')
  @UseGuards(JwtAuthGuard, CsrfGuard)
  update(@Param('id') id: string, @Body() dto: UpdateShareLinkDto) {
    return this.links.update(id, dto);
  }

  @Delete('v1/admin/links/:id')
  @UseGuards(JwtAuthGuard, CsrfGuard)
  async remove(@Param('id') id: string) {
    await this.links.remove(id);
    return { ok: true };
  }
}
