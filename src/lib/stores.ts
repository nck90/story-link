export interface Store {
    id: string
    name: string
    slug: string
    category: string // e.g., "돼지고기구이"
    intro: string // One line intro e.g., "온천천 삼겹살, 돼지고기 맛집"
    description: string
    images: string[] // Array of image URLs
    // Old menus field is deprecated but kept optional for other stores if needed
    menus?: string[]
    menuCategories?: MenuCategory[]
    mapUrl?: string // Optional map image URL
    logoUrl?: string // Optional logo overlay
    benefitText: string
    uploaderBenefitText?: string
    usageCondition: string
    pinCode: string // Mock PIN for verification
    address: string // Store address
}

export interface MenuItem {
    name: string
    description?: string
    price: string
    imageUrl?: string
    isSoldOut?: boolean
    isNew?: boolean
}

export interface MenuCategory {
    title: string
    items: MenuItem[]
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
        menuCategories: [
            {
                title: '메인 메뉴',
                items: [
                    {
                        name: '류센소',
                        description: '돈코츠 라멘',
                        price: '10,000원',
                        imageUrl: '/resenso/류센소(돈코츠 라멘), 10,000.PNG',
                    },
                    {
                        name: '류센소 카라',
                        description: '매운 돈코츠 라멘',
                        price: '10,000원',
                        imageUrl: '/resenso/류센소 카라(10,000원).PNG',
                    },
                    {
                        name: '류센소 아사리',
                        description: '소유 라멘',
                        price: '10,000원',
                        imageUrl: '/resenso/류센소 아사리, 10,000원.PNG',
                    },
                    {
                        name: '류센소 카키',
                        description: '굴 라멘',
                        price: '12,000원',
                        imageUrl: '/resenso/류센소 카키, 12,000원.PNG',
                    },
                    {
                        name: '류센소 에비미소',
                        description: '새우 된장 라멘',
                        price: '12,000원',
                        imageUrl: '/resenso/류센소 에비미소, 12,000원.PNG',
                    },
                    {
                        name: '냉라멘',
                        description: '여름 시즌 메뉴',
                        price: '10,000원',
                        imageUrl: '/resenso/냉라멘(여름), 10,000원.PNG',
                    },
                    {
                        name: '카츠동',
                        description: '돈까스덮밥',
                        price: '12,000원',
                        imageUrl: '/resenso/카츠동, 12,000원.PNG',
                        isNew: true,
                    },
                    {
                        name: '에비동',
                        description: '새우튀김덮밥',
                        price: '12,000원',
                        imageUrl: '/resenso/에비동(새우튀김덮밥). 12,000원.PNG',
                        isNew: true,
                    },
                    {
                        name: '가라아게동',
                        description: '치킨튀김덮밥',
                        price: '11,000원',
                        imageUrl: '/resenso/가라아게동(치킨튀김덮밥), 11,000.PNG',
                        isNew: true,
                    },
                ]
            },
            {
                title: '사이드 메뉴',
                items: [
                    {
                        name: '흑돼지 교자',
                        description: '5pcs',
                        price: '8,000원',
                    },
                    {
                        name: '교자',
                        description: '5pcs',
                        price: '6,000원',
                    },
                    {
                        name: '문어 카라아게',
                        price: '12,000원',
                    },
                    {
                        name: '토리 가라아게',
                        description: '닭 튀김 8pcs',
                        price: '7,000원',
                    },
                    {
                        name: '카키 후라이',
                        description: '굴튀김 6pcs',
                        price: '11,000원',
                    },
                    {
                        name: '반반교자',
                        description: '흑돼지교자 + 일반 교자',
                        price: '9,000원',
                    },
                ]
            },
            {
                title: '드링크',
                items: [
                    {
                        name: '음료수',
                        price: '2,000원',
                    },
                    {
                        name: '에이드',
                        price: '5,000원',
                    },
                    {
                        name: '우롱차',
                        price: '5,000원',
                    },
                    {
                        name: '맥주',
                        price: '5,000원',
                    },
                    {
                        name: '소주',
                        price: '5,000원',
                    },
                    {
                        name: '류센소 하이볼',
                        price: '8,000원',
                    },
                    {
                        name: '얼그레이 하이볼',
                        price: '9,000원',
                    },
                    {
                        name: '산토리생맥주',
                        description: '370ml',
                        price: '5,500원',
                    },
                ]
            }
        ],
        mapUrl: '/resenso/류센소 약도.PNG',
        benefitText: '새우튀김 or 가라아게 3pc',
        uploaderBenefitText: '에이드 한 잔 무료',
        usageCondition: '메인 메뉴 2개 주문 시', // Updated as requested
        pinCode: '0002',
    }
]

export function getStoreBySlug(slug: string): Store | undefined {
    return STORES.find(store => store.slug === slug)
}
