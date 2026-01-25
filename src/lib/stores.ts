export interface Store {
    id: string
    name: string
    slug: string
    description: string
    imageUrl: string
    benefitText: string
    uploaderBenefitText?: string
    usageCondition: string
}

export const STORES: Store[] = [
    {
        id: '1',
        name: '인사불성 파스타',
        slug: 'pasta',
        description: '서면에서 유명한 파스타 가게',
        imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80',
        benefitText: '음료 1잔 무료',
        uploaderBenefitText: '파스타 메뉴 10% 할인',
        usageCondition: '파스타 메뉴 주문 시',
    }
]

export function getStoreBySlug(slug: string): Store | undefined {
    return STORES.find(store => store.slug === slug)
}
