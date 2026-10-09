import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import * as argon2 from 'argon2';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth & Collect (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let dbAvailable = true;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);
    dbAvailable = await prisma.ping();
    if (dbAvailable) {
      const email = process.env.ADMIN_EMAIL!.toLowerCase();
      const hash = await argon2.hash(process.env.ADMIN_PASSWORD!);
      await prisma.adminUser.upsert({
        where: { email },
        create: {
          email,
          name: process.env.ADMIN_NAME ?? 'Test Admin',
          passwordHash: hash,
        },
        update: { passwordHash: hash },
      });
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /v1/auth/me sans cookie → 401', () => {
    return request(app.getHttpServer()).get('/v1/auth/me').expect(401);
  });

  it('login KO', async () => {
    if (!dbAvailable) return;
    await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: 'admin@test.local', password: 'wrong-password-xyz' })
      .expect(401);
  });

  it('login OK + me + logout', async () => {
    if (!dbAvailable) return;
    const agent = request.agent(app.getHttpServer());
    await agent
      .post('/v1/auth/login')
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      })
      .expect(200);
    await agent.get('/v1/auth/me').expect(200);
    await agent.post('/v1/auth/logout').expect(200);
  });

  it('POST /v1/collect crée une session', async () => {
    if (!dbAvailable) return;
    const visitorId = randomUUID();
    const sessionId = randomUUID();
    const pageViewId = randomUUID();
    const payload = {
      v: 1,
      visitorId,
      sessionId,
      context: {
        isNewSession: true,
        landingPath: '/',
        referrer: '',
        utm: {
          source: null,
          medium: null,
          campaign: null,
          term: null,
          content: null,
        },
        screen: { w: 1920, h: 1080 },
        viewport: { w: 1440, h: 900 },
        language: 'fr-FR',
        timezone: 'Africa/Lubumbashi',
      },
      events: [
        {
          type: 'PAGEVIEW',
          pageViewId,
          path: '/',
          title: 'Test',
          ts: Date.now(),
        },
        {
          type: 'HEARTBEAT',
          pageViewId,
          activeSeconds: 15,
          maxScrollPct: 40,
          ts: Date.now() + 1000,
        },
      ],
    };

    await request(app.getHttpServer())
      .post('/v1/collect')
      .set('Content-Type', 'text/plain')
      .send(JSON.stringify(payload))
      .expect(204);

    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    expect(session).not.toBeNull();
    expect(session?.activeSeconds).toBeGreaterThanOrEqual(15);

    await prisma.event.deleteMany({ where: { sessionId } });
    await prisma.pageView.deleteMany({ where: { sessionId } });
    await prisma.session.delete({ where: { id: sessionId } });
    await prisma.visitor.delete({ where: { id: visitorId } }).catch(() => undefined);
  });
});
