import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: 현재 설정 조회
export async function GET(request: NextRequest) {
    const password = request.nextUrl.searchParams.get('password')

    if (password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        let settings = await prisma.settings.findUnique({
            where: { id: 'default' }
        })

        // 기본값 생성
        if (!settings) {
            settings = await prisma.settings.create({
                data: {
                    id: 'default',
                    activationHours: 3,
                    expirationDays: 14,
                    chainExtensionDays: 14
                }
            })
        }

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Failed to get settings:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// POST: 설정 업데이트
export async function POST(request: NextRequest) {
    const password = request.nextUrl.searchParams.get('password')

    if (password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { activationHours, expirationDays, chainExtensionDays } = body

        const settings = await prisma.settings.upsert({
            where: { id: 'default' },
            update: {
                activationHours: activationHours ?? 3,
                expirationDays: expirationDays ?? 14,
                chainExtensionDays: chainExtensionDays ?? 14
            },
            create: {
                id: 'default',
                activationHours: activationHours ?? 3,
                expirationDays: expirationDays ?? 14,
                chainExtensionDays: chainExtensionDays ?? 14
            }
        })

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Failed to update settings:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
