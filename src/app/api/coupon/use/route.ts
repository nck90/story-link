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
        })

        if (!coupon) {
            return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
        }

        if (coupon.status === 'USED') {
            return NextResponse.json({ error: 'Coupon already used' }, { status: 400 })
        }

        // 3-Hour Rule Check (Server Side)
        const issuedAt = new Date(coupon.issuedAt).getTime()
        const now = new Date().getTime()
        const threeHours = 3 * 60 * 60 * 1000

        if (now - issuedAt < threeHours) {
            return NextResponse.json({
                error: 'Coupon is not yet active. Please wait 3 hours after issuance.'
            }, { status: 403 })
        }

        const updatedCoupon = await prisma.coupon.update({
            where: { id: couponId },
            data: {
                status: 'USED',
                usedAt: new Date(),
            },
        })

        return NextResponse.json(updatedCoupon)
    } catch (error) {
        console.error('Failed to use coupon:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
