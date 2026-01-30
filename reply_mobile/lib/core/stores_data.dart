
// Reuse CouponStore structure or define new if needed.
// Since StorePage needs more fields than CouponStore, let's define a full Store model here or in core.
// For simplicity, let's define it here.

class StoreData {
  final String id;
  final String name;
  final String slug;
  final String category;
  final String intro;
  final String description;
  final List<String> images;
  final String? logoUrl;
  final String benefitText;
  final String? uploaderBenefitText;
  final String usageCondition;
  final String pinCode;
  final String address;

  const StoreData({
    required this.id,
    required this.name,
    required this.slug,
    required this.category,
    required this.intro,
    required this.description,
    required this.images,
    this.logoUrl,
    required this.benefitText,
    this.uploaderBenefitText,
    required this.usageCondition,
    required this.pinCode,
    required this.address,
  });
}

const List<StoreData> stores = [
  StoreData(
    id: '1',
    name: '먹음직(온천천 점)',
    slug: 'pasta',
    category: '돼지고기구이',
    intro: '온천천 삼겹살, 돼지고기 맛집',
    description: '최고급 숙성 한돈을 전문 그릴러가 직접 구워드리는 프리미엄 고기집입니다.',
    images: [
      'https://raw.githubusercontent.com/bagjun/reply-assets/main/main.jpeg', // Using placeholders or remote URLs since local assets won't load easily in RN/Flutter without config
      // In real prod, these should be asset paths or valid URLs.
      // For now, I will use valid placeholders or assume the user has these assets served.
      // Since the web app uses relative paths '/main.jpeg', they are likely in `public/`.
      // I cannot access `public/` from the mobile app easily unless I copy them to flutter assets.
      // I will assume for now we use a base URL placeholder.
      'https://story-link-silk.vercel.app/main.jpeg',
      'https://story-link-silk.vercel.app/image1.jpeg',
      'https://story-link-silk.vercel.app/image2.jpeg',
      'https://story-link-silk.vercel.app/image3.jpeg',
      'https://story-link-silk.vercel.app/image4.jpeg',
      'https://story-link-silk.vercel.app/image5.jpeg',
      'https://story-link-silk.vercel.app/image6.jpeg',
      'https://story-link-silk.vercel.app/image7.jpeg',
    ],
    logoUrl: 'https://story-link-silk.vercel.app/logo.png',
    benefitText: '소주 or 맥주 한 병 무료',
    uploaderBenefitText: '음료 한 병 무료',
    usageCondition: '고기 3인분 이상 주문 시',
    pinCode: '0001',
    address: '부산광역시 동래구 온천천로431번길 4-1 (안락동 632-124)',
  ),
];

StoreData? getStoreBySlug(String slug) {
  try {
    return stores.firstWhere((s) => s.slug == slug);
  } catch (e) {
    return null;
  }
}
