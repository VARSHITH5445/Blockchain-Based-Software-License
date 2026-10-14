import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PostgreSQL database with academic demo records...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create or upsert users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@licensechain.org' },
    update: {},
    create: {
      email: 'admin@licensechain.org',
      passwordHash,
      name: 'System Administrator',
      role: 'ADMIN',
      walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    },
  });

  const publisher = await prisma.user.upsert({
    where: { email: 'publisher@cybershield.io' },
    update: {},
    create: {
      email: 'publisher@cybershield.io',
      passwordHash,
      name: 'TechSoft Cyber Labs',
      role: 'PUBLISHER',
      walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@enterprise.com' },
    update: {},
    create: {
      email: 'customer@enterprise.com',
      passwordHash,
      name: 'Alice Johnson (Enterprise)',
      role: 'CUSTOMER',
      walletAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    },
  });

  console.log(`✔ Users created: Admin (${admin.email}), Publisher (${publisher.email}), Customer (${customer.email})`);

  // 2. Create products
  const product1 = await prisma.softwareProduct.upsert({
    where: { slug: 'cybershield-pro' },
    update: {},
    create: {
      name: 'CyberShield Pro Enterprise',
      slug: 'cybershield-pro',
      description: 'Zero-trust endpoint defense, kernel packet sniffer, and threat mitigation with seat-based cryptographic licensing.',
      category: 'Cybersecurity',
      version: 'v4.2.0',
      imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
      publisherId: publisher.id,
      plans: {
        create: [
          {
            name: 'Multi-Seat Enterprise (3 Nodes)',
            licenseType: 'SEAT_BASED',
            durationDays: 0,
            maxSeats: 3,
            priceDemo: 0.35,
            isDefault: true,
          },
        ],
      },
    },
  });

  const product2 = await prisma.softwareProduct.upsert({
    where: { slug: 'devide-studio' },
    update: {},
    create: {
      name: 'DevIDE Studio 2026',
      slug: 'devide-studio',
      description: 'Cloud-native IDE with smart contract static analysis, gas profiler, and on-chain license verification.',
      category: 'Development Tool',
      version: 'v2.5.1',
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
      publisherId: publisher.id,
      plans: {
        create: [
          {
            name: 'Perpetual Developer License',
            licenseType: 'PERPETUAL',
            durationDays: 0,
            maxSeats: 1,
            priceDemo: 0.20,
            isDefault: true,
          },
        ],
      },
    },
  });

  const product3 = await prisma.softwareProduct.upsert({
    where: { slug: 'neural-pipeline' },
    update: {},
    create: {
      name: 'NeuralData Pipeline',
      slug: 'neural-pipeline',
      description: 'High-throughput distributed deep learning cluster orchestration engine with 30-day recurring subscription.',
      category: 'AI / Data Science',
      version: 'v1.8.0',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      publisherId: publisher.id,
      plans: {
        create: [
          {
            name: 'Monthly Recurring Subscription',
            licenseType: 'SUBSCRIPTION',
            durationDays: 30,
            maxSeats: 2,
            priceDemo: 0.12,
            isDefault: true,
          },
        ],
      },
    },
  });

  console.log('✔ Seeded 3 software products and license plans.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
