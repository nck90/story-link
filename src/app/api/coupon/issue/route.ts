import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { nanoid } from 'nanoid'

export async function POST(request: Request) {
    let storeId = 'DEMO'
    let storeName = 'Demo Store'
    let benefit = 'Demo Benefit'

    try {
        const body = await request.json()
        storeId = body.storeId || 'DEMO'
        storeName = body.storeName || 'Demo Store'
        benefit = body.benefit || 'Demo Benefit'
        const linkGenId = body.linkGenId

        if (!storeId || !storeName || !benefit) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Generate unique ID (e.g., STORE-XXX)
        const codeId = nanoid(8).toUpperCase()
        const couponId = `${storeId}-${codeId}`

        const coupon = await prisma.coupon.create({
            data: {
                id: couponId,
                code: codeId,
                status: 'ISSUED',
                storeId,
                storeName,
                benefit,
                linkGenId: linkGenId || null,
            },
        })

        return NextResponse.json(coupon)
    } catch (error) {
        console.error('Failed to issue coupon:', error)
        // Return mock coupon when database is unavailable (demo mode)
        const codeId = nanoid(8).toUpperCase()
        return NextResponse.json({
            id: `${storeId}-${codeId}`,
            code: codeId,
            status: 'ISSUED',
            storeId,
            storeName,
            benefit,
            issuedAt: new Date().toISOString(),
            dbStatus: 'disconnected'
        })
    }
}
