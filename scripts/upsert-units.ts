#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function upsertUnits() {
  try {
    console.log('🔄 Upserting standard units...');

    const units = [
      { name: 'gram', symbol: 'g', multiplier: 1.0, isActive: true, sortOrder: 1 },
      { name: 'kilogram', symbol: 'kg', multiplier: 1000.0, isActive: true, sortOrder: 2 },
      { name: 'liter', symbol: 'L', multiplier: 1.0, isActive: true, sortOrder: 3 },
      { name: 'milliliter', symbol: 'ml', multiplier: 0.001, isActive: true, sortOrder: 4 },
      { name: 'package', symbol: 'pkg', multiplier: 1.0, isActive: true, sortOrder: 5 },
      { name: 'piece', symbol: 'pcs', multiplier: 1.0, isActive: true, sortOrder: 6 },
    ];

    for (const u of units) {
      const existing = await prisma.unit.findUnique({ where: { symbol: u.symbol } });
      if (existing) {
        console.log(` - Unit exists: ${u.symbol} (${existing.id})`);
        continue;
      }
      const created = await prisma.unit.create({ data: { ...u } });
      console.log(` + Created unit: ${u.symbol} (${created.id})`);
    }

    const all = await prisma.unit.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
    console.log(`✅ Active units count: ${all.length}`);
  } catch (error) {
    console.error('❌ Error upserting units:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

upsertUnits();
