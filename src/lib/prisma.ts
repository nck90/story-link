import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

// Create Prisma adapter with Turso configuration
const url = process.env.TURSO_DATABASE_URL || 'file:./prisma/dev.db'
const authToken = process.env.TURSO_AUTH_TOKEN

const adapter = new PrismaLibSql({
    url,
    authToken: authToken || undefined,
})

// PrismaClient singleton
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
