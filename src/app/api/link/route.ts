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
        // Return mock data when database is unavailable (demo mode)
        return NextResponse.json({
            id: 'demo-' + Date.now(),
            storeSlug: storeSlug,
            createdAt: new Date().toISOString(),
            dbStatus: 'disconnected'
        })
    }
}
