import { PrismaClient } from '@prisma/client';

// DATABASE_URL is optional during the football-first phase. When supplied,
// Prisma uses the real database; otherwise it falls back to localhost.
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';

export const prisma = new PrismaClient({
  datasources: {
    db: { url: databaseUrl }
  }
});
