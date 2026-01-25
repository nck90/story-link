import CouponPageClient from './CouponPageClient'

interface PageProps {
    params: Promise<{ couponId: string }>
}

export default async function CouponPage({ params }: PageProps) {
    const { couponId } = await params

    return (
        <CouponPageClient
            couponId={couponId}
        />
    )
}

export async function generateMetadata({ params }: PageProps) {
    return {
        title: '쿠폰 확인 | Reply',
        description: '발급받은 쿠폰을 확인하세요',
    }
}
