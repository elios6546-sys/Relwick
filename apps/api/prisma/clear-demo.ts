import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const demoIpFilter = {
  OR: [
    { ip: { startsWith: '192.0.2.' } },
    { ip: { startsWith: '198.51.100.' } },
    { ip: { startsWith: '203.0.113.' } },
  ],
};

async function main(): Promise<void> {
  const demoSessions = await prisma.session.findMany({
    where: demoIpFilter,
    select: { id: true, visitorId: true },
  });
  const sessionIds = demoSessions.map((s) => s.id);
  const visitorIds = [...new Set(demoSessions.map((s) => s.visitorId))];

  if (sessionIds.length === 0) {
    console.log('Aucune donnée de démo à supprimer.');
    return;
  }

  await prisma.lead.deleteMany({ where: { sessionId: { in: sessionIds } } });

  await prisma.session.deleteMany({ where: { id: { in: sessionIds } } });

  for (const visitorId of visitorIds) {
    const remaining = await prisma.session.count({ where: { visitorId } });
    if (remaining === 0) {
      await prisma.visitor.delete({ where: { id: visitorId } }).catch(() => undefined);
    }
  }

  console.log(`${sessionIds.length} session(s) de démo supprimée(s).`);
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
