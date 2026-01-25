import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ couponId: string }> }
) {
    try {
        const { couponId } = await params

        const coupon = await prisma.coupon.findUnique({
            where: { id: couponId },
            include: {
                store: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        description: true,
                        imageUrl: true,
                        benefitText: true,
                        usageCondition: true,
                    }
                }
            }
        })

        if (!coupon) {
            return NextResponse.json(
                { error: '쿠폰을 찾을 수 없습니다' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            id: coupon.id,
            code: coupon.code,
            status: coupon.status,
            createdAt: coupon.createdAt,
            usedAt: coupon.usedAt,
            store: coupon.store,
        })
    } catch (error) {
        console.error('Coupon fetch error:', error)
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다' },
            { status: 500 }
        )
    }
}
