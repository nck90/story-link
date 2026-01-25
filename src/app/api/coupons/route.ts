import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { generateCouponCode, generateShortId } from '@/lib/utils'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { storeId, storyLinkId } = body

        // Get User ID from cookie or generate new one
        const cookieStore = await cookies()
        let userId = cookieStore.get('reply_user_id')?.value
        let isNewUser = false

        if (!userId) {
            userId = generateShortId(10)
            isNewUser = true
        }

        if (!storeId) {
            return NextResponse.json(
                { error: 'storeId가 필요합니다' },
                { status: 400 }
            )
        }

        // Ensure User exists
        await prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: { id: userId }
        })

        // Verify store exists
        const store = await prisma.store.findUnique({
            where: { id: storeId }
        })

        if (!store) {
            return NextResponse.json(
                { error: '가게를 찾을 수 없습니다' },
                { status: 404 }
            )
        }

        // Verify story link if provided
        if (storyLinkId) {
            const storyLink = await prisma.storyLink.findUnique({
                where: { id: storyLinkId }
            })

            if (!storyLink) {
                return NextResponse.json(
                    { error: '유효하지 않은 스토리 링크입니다' },
                    { status: 400 }
                )
            }
        }

        // Generate coupon code with store prefix
        const prefix = store.slug.toUpperCase().slice(0, 5)
        const code = generateCouponCode(prefix)

        // Create coupon with ownerId
        const coupon = await prisma.coupon.create({
            data: {
                storeId,
                storyLinkId: storyLinkId || null,
                ownerId: userId,
                code,
                status: 'ISSUED',
            },
            include: {
                store: {
                    select: {
                        name: true,
                        slug: true,
                        benefitText: true,
                        usageCondition: true,
                    }
                }
            }
        })

        const response = NextResponse.json({
            id: coupon.id,
            code: coupon.code,
            status: coupon.status,
            createdAt: coupon.createdAt,
            store: coupon.store,
        })

        if (isNewUser) {
            response.cookies.set('reply_user_id', userId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 365, // 1 year
            })
        }

        return response
    } catch (error) {
        console.error('Coupon creation error:', error)
        console.error(error) // detailed log
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다' },
            { status: 500 }
        )
    }
}
