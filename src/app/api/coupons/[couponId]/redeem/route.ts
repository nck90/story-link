import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// In-memory rate limiting
const failedAttempts = new Map<string, { count: number; lastAttempt: Date }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_MINUTES = 30
// const MILEAGE_AMOUNT = 100 // Defined below locally if needed, or use const

export async function POST(
    request: Request,
    { params }: { params: Promise<{ couponId: string }> }
) {
    try {
        const { couponId } = await params
        const body = await request.json()
        const { pin } = body

        if (!pin) {
            return NextResponse.json(
                { success: false, error: 'PIN을 입력해주세요' },
                { status: 400 }
            )
        }

        const attemptKey = couponId
        const attempts = failedAttempts.get(attemptKey)

        if (attempts) {
            const timeSinceLastAttempt = Date.now() - attempts.lastAttempt.getTime()
            const lockoutMs = LOCKOUT_MINUTES * 60 * 1000

            if (attempts.count >= MAX_ATTEMPTS && timeSinceLastAttempt < lockoutMs) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.`,
                        locked: true
                    },
                    { status: 429 }
                )
            }

            if (timeSinceLastAttempt >= lockoutMs) {
                failedAttempts.delete(attemptKey)
            }
        }

        // Fetch coupon
        const coupon = await prisma.coupon.findUnique({
            where: { id: couponId },
            include: {
                store: {
                    select: {
                        pinHash: true,
                        name: true,
                    }
                },
                storyLink: true,
            }
        })

        if (!coupon) {
            return NextResponse.json(
                { success: false, error: '쿠폰을 찾을 수 없습니다' },
                { status: 404 }
            )
        }

        if (coupon.status === 'USED') {
            return NextResponse.json(
                { success: false, error: '이미 사용된 쿠폰입니다' },
                { status: 400 }
            )
        }

        // Verify PIN
        const isValidPin = await bcrypt.compare(pin, coupon.store.pinHash)

        if (!isValidPin) {
            const currentAttempts = failedAttempts.get(attemptKey)
            const newCount = (currentAttempts?.count || 0) + 1
            failedAttempts.set(attemptKey, { count: newCount, lastAttempt: new Date() })

            const attemptsLeft = MAX_ATTEMPTS - newCount

            return NextResponse.json(
                {
                    success: false,
                    error: 'PIN이 일치하지 않습니다',
                    attemptsLeft: Math.max(0, attemptsLeft)
                },
                { status: 401 }
            )
        }

        failedAttempts.delete(attemptKey)

        // Transaction
        const mileageAmount = 100

        await prisma.$transaction(async (tx) => {
            // 1. Mark Coupon as USED
            await tx.coupon.update({
                where: { id: couponId },
                data: {
                    status: 'USED',
                    usedAt: new Date(),
                }
            })

            // 2. Add Mileage to Coupon Owner
            if (coupon.ownerId) {
                await tx.mileageLog.create({
                    data: {
                        userId: coupon.ownerId,
                        amount: mileageAmount,
                        reason: '쿠폰 사용 적립',
                        couponId: coupon.id,
                    }
                })
            }

            // 3. Add Mileage to Story Uploader
            if (coupon.storyLink?.uploaderId) {
                if (coupon.storyLink.uploaderId !== coupon.ownerId) {
                    await tx.mileageLog.create({
                        data: {
                            userId: coupon.storyLink.uploaderId,
                            amount: mileageAmount,
                            reason: `친구(${coupon.code}) 방문 적립`,
                            couponId: coupon.id,
                        }
                    })
                }
            }
        })

        return NextResponse.json({
            success: true,
            message: '쿠폰이 사용되었습니다.',
            mileage: mileageAmount,
            storeName: coupon.store.name,
        })
    } catch (error) {
        console.error('Redeem error:', error)
        return NextResponse.json(
            { success: false, error: '서버 오류가 발생했습니다' },
            { status: 500 }
        )
    }
}
