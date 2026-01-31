import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { STORES } from '@/lib/stores'

interface RouteParams {
    params: Promise<{
        couponId: string
    }>
}

export async function GET(request: Request, { params }: RouteParams) {
    const { couponId } = await params

    if (!couponId) {
        return NextResponse.json({ error: 'Missing coupon ID' }, { status: 400 })
    }

    try {
        const coupon = await prisma.coupon.findUnique({
            where: { id: couponId },
        })

        if (!coupon) {
            return NextResponse.json({ error: '쿠폰을 찾을 수 없습니다.' }, { status: 404 })
        }

        // Find store image from STORES
        const store = STORES.find(s => s.id === coupon.storeId)
        const storeImage = store?.images[0] || '/main.jpeg'

        return NextResponse.json({
            ...coupon,
            storeImage
        })
    } catch (error) {
        console.error('Failed to fetch coupon:', error)
        return NextResponse.json({ error: '시스템 오류가 발생했습니다.' }, { status: 500 })
    }
}
