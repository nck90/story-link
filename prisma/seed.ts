import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Hash PIN for test store (PIN: 1234)
    const pinHash = await bcrypt.hash('1234', 10)

    // Create test store: 인사불성 파스타
    const store = await prisma.store.upsert({
        where: { slug: 'pasta' },
        update: {},
        create: {
            name: '인사불성 파스타',
            slug: 'pasta',
            description: '서면에서 유명한 파스타 가게',
            imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80',
            benefitText: '음료 1잔 무료',
            usageCondition: '파스타 메뉴 주문 시',
            pinHash,
        }
    })

    console.log('✅ Created store:', store.name)
    console.log('   Slug:', store.slug)
    console.log('   PIN: 1234 (for testing)')

    // Create a sample story link
    const storyLink = await prisma.storyLink.create({
        data: {
            id: 'a7b1c2',
            storeId: store.id,
        }
    })

    console.log('✅ Created sample story link:', storyLink.id)

    console.log('')
    console.log('🎉 Seeding completed!')
    console.log('')
    console.log('📍 Test URLs:')
    console.log('   Store page: /pasta')
    console.log('   Story link: /pasta?source=story&link=a7b1c2')
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
