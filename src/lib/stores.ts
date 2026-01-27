export interface Store {
    id: string
    name: string
    slug: string
    category: string // e.g., "돼지고기구이"
    intro: string // One line intro e.g., "온천천 삼겹살, 돼지고기 맛집"
    description: string
    images: string[] // Array of image URLs
    logoUrl?: string // Optional logo overlay
    benefitText: string
    uploaderBenefitText?: string
    usageCondition: string
    pinCode: string // Mock PIN for verification
}

export const STORES: Store[] = [
    {
        id: '1',
        name: '온천천 먹음직',
        slug: 'pasta', // Keeping 'pasta' slug as requested for continuity or changing? PRD says "먹음직 온천천점". 
        // Note: User prompt has "인사불성 파스타 -> 먹음직 온천천점" but let's check if slug needs change.
        // User didn't explicitly say change slug, but I should probably add a new one or update this one.
        // I'll keep the slug 'pasta' for now to avoid breaking existing links if any, OR I can add 'meokumjik'. 
        // Let's stick to updating the 'pasta' entry to '먹음직' to follow the "Modification" request naturally.
        // Actually, the slug is visible in URL. Let's redirect or just use 'meokumjik' if I were creating new. 
        // Given I'm "modifying", I'll update the content of the existing entry but maybe keep the slug or alias it?
        // Let's just update the content for now.
        category: '돼지고기구이',
        intro: '온천천 삼겹살, 돼지고기 맛집',
        description: '최고급 숙성 한돈을 전문 그릴러가 직접 구워드리는 프리미엄 고기집입니다.',
        images: [
            '/main.jpeg',
            '/image1.jpeg',
            '/image2.jpeg',
            '/image3.jpeg',
            '/image4.jpeg',
            '/image5.jpeg',
            '/image6.jpeg',
            '/image7.jpeg',
        ],
        logoUrl: '/logo.png',
        benefitText: '소주 or 맥주 한 병 무료',
        uploaderBenefitText: '음료 한 병 무료',
        usageCondition: '고기 3인분 이상 주문 시',
        pinCode: '0000', // Mock PIN
    }
]

export function getStoreBySlug(slug: string): Store | undefined {
    return STORES.find(store => store.slug === slug)
}
