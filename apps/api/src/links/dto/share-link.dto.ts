import { SharePlatform } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateShareLinkDto {
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsEnum(SharePlatform)
  platform!: SharePlatform;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(120)
  campaign?: string;

  /** Chemin interne uniquement (« / », « /#services », « /#contact »…). */
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(512)
  @Matches(/^\/(?!\/)[^\s]*$/, { message: 'La page cible doit être un chemin interne.' })
  targetPath?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(2000)
  note?: string;
}

export class UpdateShareLinkDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsEnum(SharePlatform)
  platform?: SharePlatform;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(120)
  campaign?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(512)
  @Matches(/^\/(?!\/)[^\s]*$/, { message: 'La page cible doit être un chemin interne.' })
  targetPath?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(2000)
  note?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
