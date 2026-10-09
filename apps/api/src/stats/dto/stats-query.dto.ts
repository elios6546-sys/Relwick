import { DeviceType, SourceCategory } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsISO8601,
  IsOptional,
  IsString,
} from 'class-validator';

function toBool(v: unknown): boolean {
  if (v === true || v === 'true' || v === '1') return true;
  if (v === false || v === 'false') return false;
  return false;
}

export class StatsQueryDto {
  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;

  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  compare?: boolean;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(DeviceType)
  deviceType?: DeviceType;

  @IsOptional()
  @IsEnum(SourceCategory)
  sourceCategory?: SourceCategory;

  @IsOptional()
  @IsString()
  browser?: string;

  @IsOptional()
  @IsString()
  os?: string;

  @IsOptional()
  @IsString()
  path?: string;

  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  includeBots?: boolean;

  /** Niveau d'agrégation géographique (route /stats/geo). */
  @IsOptional()
  @IsIn(['country', 'city'])
  level?: 'country' | 'city';
}
