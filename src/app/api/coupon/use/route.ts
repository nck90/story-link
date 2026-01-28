import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { couponId } = body

        if (!couponId) {
            return NextResponse.json({ error: 'Missing coupon ID' }, { status: 400 })
        }

        const coupon = await prisma.coupon.findUnique({
            where: { id: couponId },
            include: { linkGen: true }
        })

        if (!coupon) {
            return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
        }

        if (coupon.status === 'USED') {
            return NextResponse.json({ error: 'Coupon already used' }, { status: 400 })
        }

        // [TEST MODE] 활성화 체크: 즉시 사용 가능 (테스트용 0초)
        const issuedAt = new Date(coupon.issuedAt).getTime()
        const now = new Date().getTime()
        const activationDelay = 0 // 즉시 활성화 (테스트용)
        const isActivated = now - issuedAt >= activationDelay

        if (!isActivated) {
            return NextResponse.json({
                error: '쿠폰이 아직 활성화되지 않았습니다. 잠시 후 다시 시도해주세요.'
            }, { status: 403 })
        }

        // Expiration Check: 유효기간 확인
        if (coupon.expiresAt) {
            const isExpired = new Date(coupon.expiresAt).getTime() <= now
            if (isExpired) {
                return NextResponse.json({
                    error: '쿠폰 유효기간이 만료되었습니다.'
                }, { status: 403 })
            }
        }

        // 쿠폰 사용 처리
        const updatedCoupon = await prisma.coupon.update({
            where: { id: couponId },
            data: {
                status: 'USED',
                usedAt: new Date(),
            },
        })

        // 🔥 체인 유효기간 연장 로직 [TEST MODE: +2분]
        // 쿠폰 사용 시 연결된 체인의 모든 쿠폰 유효기간 +2분 연장
        if (coupon.linkGenId && coupon.linkGen?.chainExpiresAt) {
            const extensionPeriod = 2 * 60 * 1000 // 2분 (테스트용)
            const currentChainExpiry = new Date(coupon.linkGen.chainExpiresAt).getTime()
            const newChainExpiresAt = new Date(currentChainExpiry + extensionPeriod)

            // LinkGen의 chainExpiresAt 업데이트
            await prisma.linkGen.update({
                where: { id: coupon.linkGenId },
                data: { chainExpiresAt: newChainExpiresAt }
            })

            // 연결된 모든 ISSUED 쿠폰의 expiresAt 업데이트
            await prisma.coupon.updateMany({
                where: {
                    linkGenId: coupon.linkGenId,
                    status: 'ISSUED'
                },
                data: { expiresAt: newChainExpiresAt }
            })

            console.log(`Chain expiration extended: LinkGen ${coupon.linkGenId} -> ${newChainExpiresAt.toISOString()}`)
        }

        return NextResponse.json(updatedCoupon)
    } catch (error) {
        console.error('Failed to use coupon:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
