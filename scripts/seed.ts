import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { riskTips } from '../lib/tips-data';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default test user
  const hashedPassword = await bcrypt.hash('johndoe123', 12);
  
  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      name: 'John Doe',
      password: hashedPassword,
      settings: {
        create: {
          tipLevel: 1,
          refreshRate: 60,
          theme: 'green',
        },
      },
    },
  });

  console.log(`Created test user: ${testUser.email}`);

  // Seed risk tips
  console.log('Seeding risk tips...');
  
  for (const tip of riskTips) {
    await prisma.riskTip.upsert({
      where: {
        level_tipNumber: {
          level: tip.level,
          tipNumber: tip.tipNumber,
        },
      },
      update: {
        title: tip.title,
        content: tip.content,
      },
      create: {
        level: tip.level,
        tipNumber: tip.tipNumber,
        title: tip.title,
        content: tip.content,
      },
    });
  }

  console.log(`Seeded ${riskTips.length} risk tips`);
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
