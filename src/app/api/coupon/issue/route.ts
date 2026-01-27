import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { nanoid } from 'nanoid'

export async function POST(request: Request) {
    let storeId = 'DEMO'
    let storeName = 'Demo Store'
    let benefit = 'Demo Benefit'

    try {
        const body = await request.json()
        // Use the values from body if present, otherwise keep defaults
        storeId = body.storeId || storeId
        storeName = body.storeName || storeName
        benefit = body.benefit || benefit
        let linkGenId = body.linkGenId

        if (!storeId || !storeName || !benefit) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Verify if linkGenId exists in DB before linking
        if (linkGenId) {
            const exists = await prisma.linkGen.findUnique({
                where: { id: linkGenId }
            })
            if (!exists) {
                console.warn(`LinkGen ID ${linkGenId} not found. Issuing unlinked coupon.`)
                linkGenId = null
            }
        }

        // Generate unique ID (e.g., STORE-XXX)
        const codeId = nanoid(8).toUpperCase()
        const couponId = `${storeId}-${codeId}`

        // Calculate expiration (3 hours from now)
        const now = new Date()
        const expiresAt = new Date(now.getTime() + 3 * 60 * 60 * 1000)

        const coupon = await prisma.coupon.create({
            data: {
                id: couponId,
                code: codeId,
                status: 'ISSUED',
                storeId,
                storeName,
                benefit,
                linkGenId: linkGenId || null,
                expiresAt,
            },
        })

        return NextResponse.json(coupon)
    } catch (error) {
        console.error('Failed to issue coupon:', error)
        return NextResponse.json({ error: '데이터베이스 저장에 실패했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 })
    }
}
