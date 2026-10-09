import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

function toBoolean(value: unknown): boolean {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return Boolean(value);
}

export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV!: NodeEnv;

  @Transform(({ value }) => (value !== undefined ? Number(value) : 4000))
  @IsInt()
  @Min(1)
  PORT!: number;

  @IsString()
  @MinLength(1)
  DATABASE_URL!: string;

  @IsUrl({ require_tld: false })
  WEB_ORIGIN!: string;

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  TRUST_PROXY!: boolean;

  @IsString()
  @MinLength(8)
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @MinLength(8)
  JWT_REFRESH_SECRET!: string;

  @IsString()
  @MinLength(1)
  COOKIE_DOMAIN!: string;

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  COOKIE_SECURE!: boolean;

  @IsEmail()
  ADMIN_EMAIL!: string;

  @IsString()
  @MinLength(8)
  ADMIN_PASSWORD!: string;

  @IsString()
  @MinLength(1)
  ADMIN_NAME!: string;

  @IsString()
  @MinLength(1)
  GEOIP_CITY_DB!: string;

  @IsString()
  @MinLength(1)
  GEOIP_ASN_DB!: string;

  @IsOptional()
  @IsString()
  DEV_FAKE_IP?: string;

  @Transform(({ value }) => (value !== undefined ? Number(value) : 395))
  @IsInt()
  @Min(1)
  RETENTION_DAYS!: number;

  @IsString()
  @MinLength(1)
  APP_TIMEZONE!: string;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: false,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
    whitelist: true,
    forbidNonWhitelisted: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .flatMap((e) => Object.values(e.constraints ?? {}))
      .join('; ');
    throw new Error(`Configuration invalide : ${messages}`);
  }

  return validated;
}
