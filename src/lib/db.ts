import { PrismaClient } from '@prisma/client'
import { env } from '@/lib/env'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.nodeEnv === 'development' ? ['query'] : [],
    datasourceUrl: env.databaseUrl,
  })

if (env.nodeEnv !== 'production') globalForPrisma.prisma = db