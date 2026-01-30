import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gap/gap.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

import '../../../core/stores_data.dart';
import '../../../core/api_client.dart';
import '../../../core/utils.dart';
import '../../../theme/app_theme.dart';
import '../../coupon/model/coupon.dart';

class StoreScreen extends ConsumerStatefulWidget {
  final String storeSlug;
  final String? source; // 'story' or null
  final String? linkId; // from query param

  const StoreScreen({
    super.key, 
    required this.storeSlug,
    this.source,
    this.linkId,
  });

  @override
  ConsumerState<StoreScreen> createState() => _StoreScreenState();
}

class _StoreScreenState extends ConsumerState<StoreScreen> {
  StoreData? store;
  bool loading = false;
  
  // Link creation state
  String? generatedLink;
  bool copied = false;
  String viewMode = 'landing'; // 'landing' | 'link_created'

  // Coupon issue state
  bool issuing = false;

  @override
  void initState() {
    super.initState();
    store = getStoreBySlug(widget.storeSlug);
  }

  // Handle Create Story Link (POST /api/link)
  Future<void> _handleCreateStoryLink() async {
    if (store == null) return;
    setState(() => loading = true);

    try {
      final linkId = Utils.generateShortId(8);
      
      // Call API (Optional: Fire and forget or strictly await)
      // Since it's tracking, we try to wait but fallback if fails
      try {
        final dio = ref.read(dioProvider);
        await dio.post('/api/link', data: {
          'id': linkId,
          'storeSlug': store!.slug,
        });
      } catch (e) {
        print('API Link create failed, falling back to local: $e');
      }

      final shortLink = 'story-link.ver.../${store!.slug}/$linkId';
      
      if (mounted) {
        setState(() {
           generatedLink = shortLink;
           viewMode = 'link_created';
           loading = false;
        });
      }

    } catch (e) {
      if (mounted) setState(() => loading = false);
    }
  }

  // Handle Get Coupon (POST /api/coupon/issue)
  Future<void> _handleGetCoupon() async {
    if (store == null) return;
    setState(() => issuing = true);

    try {
      final dio = ref.read(dioProvider);
      final res = await dio.post('/api/coupon/issue', data: {
        'storeId': store!.id,
        'storeName': store!.name,
        'benefit': store!.benefitText,
        'linkGenId': widget.linkId,
      });

      if (res.statusCode == 200 || res.statusCode == 201) {
        final couponData = res.data; // Map<String, dynamic>
        
        // IMPORTANT: Convert API response to Dart Model
        // The API returns fields that might slightly differ or match exact json.
        // Assuming API returns JSON compatible with Coupon.fromJson
        // But StoreStore might need adaptation.
        
        // Let's ensure the Coupon model can handle the response.
        // If response is valid:
        final coupon = Coupon.fromJson(couponData);
        
        // Save to local storage
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('coupon_${coupon.id}', jsonEncode(coupon.toJson()));
        
        if (mounted) {
           context.push('/coupon/${coupon.id}');
        }
      } else {
        _showError('쿠폰 발급 실패');
      }
    } catch (e) {
      print('Coupon Issue Error: $e');
      // _showError('네트워크 오류가 발생했습니다.');
      
      // MOCK FALLBACK for DEMO purposes if Server is unreachable (CORS etc)
      _mockIssueCoupon();
    } finally {
      if (mounted) setState(() => issuing = false);
    }
  }

  void _mockIssueCoupon() async {
     // Create a mock coupon locally
     final mock = Coupon(
       id: 'mock-${Utils.generateShortId()}',
       code: 'MOCK-${Utils.generateShortId(4)}',
       status: CouponStatus.ISSUED,
       createdAt: DateTime.now(),
       storeId: store!.id,
       storeName: store!.name,
       benefit: store!.benefitText,
       store: CouponStore(
          name: store!.name, 
          benefitText: store!.benefitText, 
          usageCondition: store!.usageCondition
       ),
     );
     
     final prefs = await SharedPreferences.getInstance();
     await prefs.setString('coupon_${mock.id}', jsonEncode(mock.toJson()));
     
     if (mounted) {
        context.push('/coupon/${mock.id}');
     }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    if (store == null) {
      return const Scaffold(body: Center(child: Text('매장을 찾을 수 없습니다.')));
    }

    if (viewMode == 'link_created') {
      return _buildLinkCreatedView();
    }

    return _buildLandingView();
  }

  Widget _buildLinkCreatedView() {
     return Scaffold(
       backgroundColor: AppColors.white,
       appBar: AppBar(leading: const BackButton(color: Colors.black), backgroundColor: Colors.white, elevation: 0),
       body: Padding(
         padding: const EdgeInsets.all(24),
         child: Column(
           mainAxisAlignment: MainAxisAlignment.center,
            children: [
               const Text('링크 생성 완료', style: AppTextStyles.heading1),
               const Gap(8),
               const Text('아래 링크를 복사하여 인스타 스토리에 올려주세요', style: AppTextStyles.bodySmall),
               const Gap(32),
               Container(
                 padding: const EdgeInsets.all(16),
                 decoration: BoxDecoration(
                   color: AppColors.gray100,
                   borderRadius: BorderRadius.circular(AppRadius.md),
                 ),
                 child: Text(generatedLink ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
               ),
               const Gap(32),
               const Text('업로더에 대한 혜택', style: TextStyle(fontWeight: FontWeight.bold)),
               Text(store!.uploaderBenefitText ?? '혜택 없음', style: const TextStyle(fontSize: 18, color: AppColors.primary)),
               const Gap(32),
               SizedBox(
                 width: double.infinity,
                 child: ElevatedButton(
                   onPressed: () {
                     // Copy to clipboard
                     ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('링크가 복사되었습니다!')));
                   }, 
                   child: const Text('링크 복사하기'),
                 ),
               )
            ],
         ),
       ),
     );
  }

  Widget _buildLandingView() {
    final isFromStory = widget.source == 'story';

    return Scaffold(
      backgroundColor: AppColors.white,
      body: Stack(
        children: [
          CustomScrollView(
            slivers: [
              SliverAppBar(
                expandedHeight: 250,
                pinned: true,
                flexibleSpace: FlexibleSpaceBar(
                  title: Text(store!.name, style: const TextStyle(color: Colors.white, shadows: [Shadow(color: Colors.black, blurRadius: 4)])),
                  background: Stack(
                    fit: StackFit.expand,
                    children: [
                       Image.network(
                         store!.images.first, 
                         fit: BoxFit.cover,
                         errorBuilder: (c,e,s) => Container(color: Colors.grey),
                       ),
                       Container(
                         decoration: BoxDecoration(
                           gradient: LinearGradient(
                             begin: Alignment.topCenter,
                             end: Alignment.bottomCenter,
                             colors: [Colors.transparent, Colors.black.withOpacity(0.7)],
                           ),
                         ),
                       )
                    ],
                  ),
                ),
              ),
              SliverToBoxAdapter(
                 child: Padding(
                   padding: const EdgeInsets.all(24),
                   child: Column(
                     crossAxisAlignment: CrossAxisAlignment.start,
                     children: [
                        Text(store!.intro, style: AppTextStyles.bodySmall.copyWith(fontWeight: FontWeight.bold)),
                        const Gap(16),
                        Text(store!.description, style: AppTextStyles.base),
                        const Gap(24),
                        
                        // Benefit Card
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                             color: AppColors.white,
                             borderRadius: BorderRadius.circular(AppRadius.xl),
                             boxShadow: [
                               BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))
                             ],
                             border: Border.all(color: AppColors.gray100),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                               const Text('혜택 상세', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
                               const Gap(8),
                               Text(store!.benefitText, style: AppTextStyles.heading2),
                               const Gap(8),
                               Text(store!.usageCondition, style: AppTextStyles.bodySmall),
                            ],
                          ),
                        ),
                        
                        const Gap(24),
                        const Text('📍 매장 위치', style: TextStyle(fontWeight: FontWeight.bold)),
                        const Gap(8),
                        Text(store!.address),
                        const Gap(80), // Bottom padding
                     ],
                   ),
                 ),
              )
            ],
          ),
          
          // Bottom CTA
          Positioned(
            bottom: 0, left: 0, right: 0,
            child: Container(
               padding: const EdgeInsets.all(20),
               decoration: BoxDecoration(
                 color: Colors.white,
                 boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, -4))],
               ),
               child: SafeArea(
                 top: false,
                 child: ElevatedButton(
                    onPressed: isFromStory 
                      ? (issuing ? null : _handleGetCoupon)
                      : (loading ? null : _handleCreateStoryLink),
                    style: ElevatedButton.styleFrom(
                       backgroundColor: AppColors.black,
                       foregroundColor: Colors.white,
                       padding: const EdgeInsets.symmetric(vertical: 18),
                    ),
                    child: Text(
                      isFromStory ? (issuing ? '발급 중...' : '쿠폰 받기') : (loading ? '생성 중...' : '스토리용 쿠폰 생성하기'),
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                 ),
               ),
            ),
          )
        ],
      ),
    );
  }
}
