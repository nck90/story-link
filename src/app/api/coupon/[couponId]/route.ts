import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

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
            // Return mock coupon for demo mode if not found
            return NextResponse.json({
                id: couponId,
                code: couponId.split('-')[1] || 'DEMO',
                status: 'ISSUED',
                storeId: couponId.split('-')[0] || 'DEMO',
                storeName: 'Demo Store',
                benefit: 'Demo Benefit',
                issuedAt: new Date().toISOString(),
                dbStatus: 'not_found'
            })
        }

        return NextResponse.json(coupon)
    } catch (error) {
        console.error('Failed to fetch coupon:', error)
        // Return mock coupon when database is unavailable (demo mode)
        return NextResponse.json({
            id: couponId,
            code: couponId.split('-')[1] || 'DEMO',
            status: 'ISSUED',
            storeId: couponId.split('-')[0] || 'DEMO',
            storeName: 'Demo Store',
            benefit: 'Demo Benefit',
            issuedAt: new Date().toISOString(),
            dbStatus: 'disconnected'
        })
    }
}
