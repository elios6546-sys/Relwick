import { EventType as SharedEventType } from '@relwick/shared';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

const STORED_TYPES = Object.values(SharedEventType).filter(
  (t) => t !== SharedEventType.HEARTBEAT,
);

export class CollectUtmDto {
  @IsOptional() @IsString() @MaxLength(120) source?: string | null;
  @IsOptional() @IsString() @MaxLength(120) medium?: string | null;
  @IsOptional() @IsString() @MaxLength(120) campaign?: string | null;
  @IsOptional() @IsString() @MaxLength(120) term?: string | null;
  @IsOptional() @IsString() @MaxLength(120) content?: string | null;
}

export class CollectContextDto {
  @IsBoolean() isNewSession!: boolean;
  @IsString() @MaxLength(512) landingPath!: string;
  @IsOptional() @IsString() referrer!: string;
  @ValidateNested() @Type(() => CollectUtmDto) utm!: CollectUtmDto;
  @IsOptional() @IsString() @MaxLength(16) shareLink?: string | null;
  @IsObject() screen!: { w: number; h: number };
  @IsObject() viewport!: { w: number; h: number };
  @IsString() @MaxLength(20) language!: string;
  @IsString() @MaxLength(64) timezone!: string;
}

export class CollectEventDto {
  @IsString()
  @IsIn([...STORED_TYPES, SharedEventType.HEARTBEAT])
  type!: string;

  @IsOptional() @IsUUID('4') pageViewId?: string;
  @IsOptional() @IsString() @MaxLength(512) path?: string;
  @IsOptional() @IsString() @MaxLength(255) title?: string;
  @IsOptional() @IsString() @MaxLength(120) name?: string;
  @IsOptional() @IsString() @MaxLength(160) label?: string;
  @IsOptional() @IsString() @MaxLength(60) section?: string;
  @IsOptional() @IsString() @MaxLength(1024) href?: string;
  @IsOptional() @IsInt() value?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(1) xPct?: number;
  @IsOptional() @IsInt() yPx?: number;
  @IsOptional() @IsInt() @Min(0) @Max(20) activeSeconds?: number;
  @IsOptional() @IsInt() @Min(0) @Max(100) maxScrollPct?: number;
  @IsOptional() @IsObject() meta?: Record<string, unknown>;
  @IsNumber() @Min(0) ts!: number;
}

export class CollectPayloadDto {
  @IsIn([1]) v!: 1;
  @IsUUID('4') visitorId!: string;
  @IsUUID('4') sessionId!: string;
  @IsOptional() @ValidateNested() @Type(() => CollectContextDto) context?: CollectContextDto;
  @IsArray() @ValidateNested({ each: true }) @Type(() => CollectEventDto) @ArrayMaxSize(50) events!: CollectEventDto[];
}
