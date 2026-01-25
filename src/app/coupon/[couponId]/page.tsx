import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CouponPageClient from './CouponPageClient'

interface PageProps {
    params: Promise<{ couponId: string }>
}

export default async function CouponPage({ params }: PageProps) {
    const { couponId } = await params

    const coupon = await prisma.coupon.findUnique({
        where: { id: couponId },
        include: {
            store: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    imageUrl: true,
                    benefitText: true,
                    usageCondition: true,
                }
            }
        }
    })

    if (!coupon) {
        notFound()
    }

    return (
        <CouponPageClient
            coupon={{
                id: coupon.id,
                code: coupon.code,
                status: coupon.status,
                createdAt: coupon.createdAt.toISOString(),
                usedAt: coupon.usedAt?.toISOString() || null,
                store: coupon.store,
            }}
        />
    )
}

export async function generateMetadata({ params }: PageProps) {
    const { couponId } = await params

    const coupon = await prisma.coupon.findUnique({
        where: { id: couponId },
        include: {
            store: { select: { name: true } }
        }
    })

    if (!coupon) {
        return { title: 'Reply' }
    }

    return {
        title: `${coupon.store.name} 쿠폰 | Reply`,
        description: `${coupon.store.name}의 특별한 혜택을 사용하세요`,
    }
}
