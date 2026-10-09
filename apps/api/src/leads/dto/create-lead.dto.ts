import { CALL_SLOTS, PROJECT_TYPES } from '@relwick/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateLeadDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName!: string;

  @ApiProperty()
  @IsString()
  @MinLength(9, { message: 'Numéro incomplet, par exemple +243 975 993 035.' })
  @MaxLength(40)
  phone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== '')
  @IsEmail({}, { message: 'Adresse e-mail invalide.' })
  @MaxLength(190)
  email?: string | null;

  @ApiProperty({ enum: PROJECT_TYPES })
  @IsIn([...PROJECT_TYPES])
  projectType!: string;

  @ApiProperty({ enum: CALL_SLOTS })
  @IsIn([...CALL_SLOTS])
  callSlot!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string | null;

  @ApiProperty()
  @IsBoolean()
  consent!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  visitorId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  sessionId?: string | null;
}
