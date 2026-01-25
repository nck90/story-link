import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    await prisma.store.update({
        where: { slug: 'pasta' },
        data: {
            uploaderBenefitText: '오늘 파스타 50% 할인'
        }
    })
    console.log('Updated store benefit text')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
