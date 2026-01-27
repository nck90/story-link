import 'dotenv/config'
import prisma from '../src/lib/prisma'

async function clearCoupons() {
    try {
        console.log('Cleaning up all coupons...')
        const result = await prisma.coupon.deleteMany({})
        console.log(`Successfully deleted ${result.count} coupons.`)

        // Also clear LinkGen to keep things clean if needed
        const linkResult = await prisma.linkGen.deleteMany({})
        console.log(`Successfully deleted ${linkResult.count} links.`)

    } catch (error) {
        console.error('Error clearing coupons:', error)
    } finally {
        process.exit()
    }
}

clearCoupons()
