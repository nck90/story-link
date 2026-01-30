export interface Store {
    id: string
    name: string
    slug: string
    category: string // e.g., "돼지고기구이"
    intro: string // One line intro e.g., "온천천 삼겹살, 돼지고기 맛집"
    description: string
    images: string[] // Array of image URLs
    menus?: string[] // Optional array of menu image URLs
    mapUrl?: string // Optional map image URL
    logoUrl?: string // Optional logo overlay
    benefitText: string
    uploaderBenefitText?: string
    usageCondition: string
    pinCode: string // Mock PIN for verification
    address: string // Store address
}

export const STORES: Store[] = [
    {
        id: '1',
        name: '먹음직(온천천 점)',
        slug: 'pasta', // Keeping 'pasta' for compatibility
        category: '돼지고기구이',
        intro: '온천천 삼겹살, 돼지고기 맛집',
        description: '최고급 숙성 한돈을 전문 그릴러가 직접 구워드리는 프리미엄 고기집입니다.',
        images: [
            '/main.jpeg',
            '/image1.jpeg',
            '/image2.jpeg',
            '/image3.jpeg',
        ],
        logoUrl: '/logo.png',
        benefitText: '소주 or 맥주 한 병 무료',
        uploaderBenefitText: '음료 한 병 무료',
        usageCondition: '고기 3인분 이상 주문 시',
        pinCode: '0001',
        address: '부산광역시 동래구 온천천로431번길 4-1 (안락동 632-124)',
    },
    {
        id: '2',
        name: '류센소(사직점)',
        slug: 'ryusenso',
        category: '일본식 라면',
        intro: '부산 사직동 일본식 라면 맛집',
        description: '부산 동래구 사직동의 깊은 국물 맛을 자랑하는 류센소입니다.',
        address: '부산 동래구 사직북로5번길 22-3 1층',
        images: [
            '/resenso/대표사진.PNG',
            '/resenso/KakaoTalk_20260129_135056760.jpg',
            '/resenso/KakaoTalk_20260129_135056760_01.jpg',
            '/resenso/KakaoTalk_20260129_135056760_02.jpg',
        ],
        menus: [
            '/resenso/KakaoTalk_20260129_135056760_03.jpg',
            '/resenso/KakaoTalk_20260129_135056760_04.jpg',
            '/resenso/KakaoTalk_20260129_135056760_05.jpg',
            '/resenso/KakaoTalk_20260129_135056760_06.jpg',
            '/resenso/KakaoTalk_20260129_135056760_07.jpg',
        ],
        mapUrl: '/resenso/류센소 약도.PNG',
        benefitText: '새우튀김 or 가라아게 3pc',
        uploaderBenefitText: '에이드 한잔',
        usageCondition: '메인 메뉴 주문 시', // Default assumption or leave empty
        pinCode: '0002',
    }
]

export function getStoreBySlug(slug: string): Store | undefined {
    return STORES.find(store => store.slug === slug)
}
