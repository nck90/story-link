import { notFound } from 'next/navigation'
import { getStoreBySlug } from '@/lib/stores'
import StorePageClient from '../StorePageClient'

interface PageProps {
    params: Promise<{
        storeSlug: string
        storyLinkId: string
    }>
}

export default async function PreCouponPage({ params }: PageProps) {
    const { storeSlug, storyLinkId } = await params
    const store = getStoreBySlug(storeSlug)

    if (!store) {
        notFound()
    }

    // Force "isFromStory" to true here
    return (
        <StorePageClient
            store={store}
            isFromStory={true}
            storyLinkId={storyLinkId}
        />
    )
}

export async function generateMetadata({ params }: PageProps) {
    const { storeSlug } = await params
    const store = getStoreBySlug(storeSlug)

    if (!store) {
        return { title: 'Reply' }
    }

    return {
        title: `${store.name}의 선물 | Reply`,
        description: `친구가 선물한 ${store.name} 특별 혜택을 확인하세요`,
    }
}
