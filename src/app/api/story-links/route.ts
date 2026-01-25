import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { generateShortId } from '@/lib/utils'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { storeId } = body

        // Get User ID from cookie or generate new one
        const cookieStore = await cookies()
        let userId = cookieStore.get('reply_user_id')?.value
        let isNewUser = false

        if (!userId) {
            userId = generateShortId(10) // Use a longer ID for users
            isNewUser = true
        }

        if (!storeId) {
            return NextResponse.json(
                { error: 'storeId가 필요합니다' },
                { status: 400 }
            )
        }

        // Ensure User exists
        await prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: { id: userId }
        })

        // Verify store exists
        const store = await prisma.store.findUnique({
            where: { id: storeId }
        })

        if (!store) {
            return NextResponse.json(
                { error: '가게를 찾을 수 없습니다' },
                { status: 404 }
            )
        }

        // Create story link with short ID & uploader
        const storyLink = await prisma.storyLink.create({
            data: {
                id: generateShortId(6),
                storeId,
                uploaderId: userId,
            }
        })

        const response = NextResponse.json({
            id: storyLink.id,
            storeId: storyLink.storeId,
            createdAt: storyLink.createdAt,
            url: `/${store.slug}?source=story&link=${storyLink.id}`,
            uploaderBenefit: store.uploaderBenefitText || '업로더 혜택이 없습니다'
        })

        if (isNewUser) {
            response.cookies.set('reply_user_id', userId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 365, // 1 year
            })
        }

        return response
    } catch (error) {
        console.error('StoryLink creation error:', error)
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다' },
            { status: 500 }
        )
    }
}
