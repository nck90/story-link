import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
    let storeSlug = 'demo'

    try {
        const body = await request.json()
        const id = body.id
        storeSlug = body.storeSlug || 'demo'
        const ipAddress = body.ipAddress

        if (!storeSlug || storeSlug === 'demo') {
            return NextResponse.json({ error: 'Store slug is required' }, { status: 400 })
        }

        const linkGen = await prisma.linkGen.create({
            data: {
                id: id || undefined,
                storeSlug,
                ipAddress: ipAddress || null,
            },
        })

        return NextResponse.json(linkGen)
    } catch (error) {
        console.error('Failed to create link gen record:', error)
        return NextResponse.json({ error: '시스템 오류로 링크를 생성할 수 없습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 })
    }
}
