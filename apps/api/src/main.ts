import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import type { EnvironmentVariables } from './config/env.validation';

// Les identifiants BigInt (événements, pages vues) sont sérialisés en chaîne.
declare global {
  interface BigInt {
    toJSON(): string;
  }
}
if (typeof BigInt.prototype.toJSON !== 'function') {
  Object.defineProperty(BigInt.prototype, 'toJSON', {
    value: function toJSON(this: bigint): string {
      return this.toString();
    },
    configurable: true,
    writable: true,
  });
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bodyParser: true });

  app.use(helmet());

  const config = app.get(ConfigService<EnvironmentVariables, true>);

  app.enableCors({
    origin: config.get('WEB_ORIGIN', { infer: true }),
    credentials: true,
  });

  // Collect POST /v1/collect : text/plain (sendBeacon) — JSON reste sur les autres routes
  app.use('/v1/collect', express.text({ type: 'text/plain', limit: '512kb' }));

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const nodeEnv = config.get('NODE_ENV', { infer: true });
  if (nodeEnv !== 'production') {
    const swagger = new DocumentBuilder()
      .setTitle('Relwick API')
      .setDescription('Mesure d\'audience et administration')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, swagger);
    SwaggerModule.setup('docs', app, document);
  }

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
}

void bootstrap();
