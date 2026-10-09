import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.toLowerCase() ?? 'elios6546@gmail.com';
  const password = process.env.ADMIN_PASSWORD ?? 'change-me';
  const name = process.env.ADMIN_NAME ?? 'Elios Ngombe';
  const passwordHash = await argon2.hash(password);

  await prisma.adminUser.upsert({
    where: { email },
    create: { email, name, passwordHash },
    update: { name, passwordHash },
  });

  const settings: Array<{ key: string; value: unknown }> = [
    { key: 'excludedIps', value: [] },
    { key: 'retentionDays', value: Number(process.env.RETENTION_DAYS ?? 395) },
    { key: 'showBotsByDefault', value: false },
    { key: 'sessionTimeoutMin', value: 30 },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      create: { key: s.key, value: s.value as object },
      update: { value: s.value as object },
    });
  }

  console.log(`Compte admin prêt : ${email}`);
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
