import { notFound } from 'next/navigation'
import { getStoreBySlug } from '@/lib/stores'
import StorePageClient from './StorePageClient'

interface PageProps {
    params: Promise<{ storeSlug: string }>
    searchParams: Promise<{ source?: string; link?: string }>
}

export default async function StorePage({ params, searchParams }: PageProps) {
    const { storeSlug } = await params
    const { source, link } = await searchParams

    const store = getStoreBySlug(storeSlug)

    if (!store) {
        notFound()
    }

    const isFromStory = source === 'story'
    const storyLinkId = link || null

    return (
        <StorePageClient
            store={store}
            isFromStory={isFromStory}
            storyLinkId={storyLinkId}
        />
    )
}

export async function generateMetadata({ params }: PageProps) {
    const { storeSlug } = await params

    const store = getStoreBySlug(storeSlug)

    if (!store) {
        return { title: 'Story Link' }
    }

    return {
        title: `${store.name} | Story Link`,
        description: store.description || `${store.name}의 특별한 혜택을 확인하세요`,
        openGraph: {
            title: `${store.name} - Story Link`,
            description: store.description,
            url: `https://story-link-silk.vercel.app/s/${storeSlug}`,
            images: store.images[0] ? [store.images[0]] : [],
        }
    }
}
