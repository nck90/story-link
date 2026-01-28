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
        let linkGen = null
        if (linkGenId) {
            linkGen = await prisma.linkGen.findUnique({
                where: { id: linkGenId }
            })
            if (!linkGen) {
                console.warn(`LinkGen ID ${linkGenId} not found. Issuing unlinked coupon.`)
                linkGenId = null
            }
        }

        // Generate unique ID (e.g., STORE-XXX)
        const codeId = nanoid(8).toUpperCase()
        const couponId = `${storeId}-${codeId}`

        // [TEST MODE] 테스트용: 3시간 활성화, 2분 유효기간
        // - 활성화 시점: 생성 + 3시간
        // - 유효기간: 2분
        const now = new Date()
        const activatesAt = new Date(now.getTime() + 3 * 60 * 60 * 1000) // +3시간
        const expirationPeriod = 2 * 60 * 1000 // 2분 (테스트용)

        let expiresAt: Date

        // 체인 유효기간 로직
        if (linkGen?.chainExpiresAt) {
            // 기존 체인 만료일 사용
            expiresAt = new Date(linkGen.chainExpiresAt)
        } else {
            // 새 체인이면 활성화 시점 + 2분
            expiresAt = new Date(activatesAt.getTime() + expirationPeriod)

            // LinkGen에 chainExpiresAt 설정
            if (linkGenId) {
                await prisma.linkGen.update({
                    where: { id: linkGenId },
                    data: { chainExpiresAt: expiresAt }
                })
            }
        }

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
