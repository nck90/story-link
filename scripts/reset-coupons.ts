import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import dotenv from 'dotenv'

dotenv.config()

const url = process.env.TURSO_DATABASE_URL || 'file:./prisma/dev.db'
const authToken = process.env.TURSO_AUTH_TOKEN

const adapter = new PrismaLibSql({
    url,
    authToken: authToken || undefined,
})

const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Resetting coupon data...')

    try {
        // Delete all coupons first (due to foreign key constraints)
        const deletedCoupons = await prisma.coupon.deleteMany()
        console.log(`Deleted ${deletedCoupons.count} coupons.`)

        // Delete all link generations
        const deletedLinks = await prisma.linkGen.deleteMany()
        console.log(`Deleted ${deletedLinks.count} link generation records.`)

        console.log('Data reset complete.')
    } catch (error) {
        console.error('Error resetting data:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
