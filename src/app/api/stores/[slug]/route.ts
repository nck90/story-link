import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params

        const store = await prisma.store.findUnique({
            where: { slug },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                imageUrl: true,
                benefitText: true,
                usageCondition: true,
            }
        })

        if (!store) {
            return NextResponse.json(
                { error: '가게를 찾을 수 없습니다' },
                { status: 404 }
            )
        }

        return NextResponse.json(store)
    } catch (error) {
        console.error('Store fetch error:', error)
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다' },
            { status: 500 }
        )
    }
}
