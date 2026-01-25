import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import StorePageClient from './StorePageClient'

interface PageProps {
    params: Promise<{ storeSlug: string }>
    searchParams: Promise<{ source?: string; link?: string }>
}

export default async function StorePage({ params, searchParams }: PageProps) {
    const { storeSlug } = await params
    const { source, link } = await searchParams

    const store = await prisma.store.findUnique({
        where: { slug: storeSlug },
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            imageUrl: true,
            benefitText: true,
            usageCondition: true,
        }
    })

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

    const store = await prisma.store.findUnique({
        where: { slug: storeSlug },
        select: { name: true, description: true }
    })

    if (!store) {
        return { title: 'Reply' }
    }

    return {
        title: `${store.name} | Reply`,
        description: store.description || `${store.name}의 특별한 혜택을 확인하세요`,
    }
}
