import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// PATCH: 개별 쿠폰 수정
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ couponId: string }> }
) {
    const password = request.nextUrl.searchParams.get('password')

    if (password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { couponId } = await params
        const body = await request.json()
        const { issuedAt, expiresAt } = body

        const updateData: { issuedAt?: Date, expiresAt?: Date } = {}

        if (issuedAt) {
            updateData.issuedAt = new Date(issuedAt)
        }
        if (expiresAt) {
            updateData.expiresAt = new Date(expiresAt)
        }

        const coupon = await prisma.coupon.update({
            where: { id: couponId },
            data: updateData
        })

        return NextResponse.json(coupon)
    } catch (error) {
        console.error('Failed to update coupon:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
