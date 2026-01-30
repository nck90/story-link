import 'package:flutter/material.dart';
import 'dart:math';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:intl/intl.dart';
import 'package:go_router/go_router.dart';

import '../../../theme/app_theme.dart';
import '../model/coupon.dart';
import '../repository/coupon_repository.dart';

class CouponScreen extends ConsumerStatefulWidget {
  final String couponId;
  const CouponScreen({super.key, required this.couponId});

  @override
  ConsumerState<CouponScreen> createState() => _CouponScreenState();
}

class _CouponScreenState extends ConsumerState<CouponScreen> {
  bool loading = true;
  Coupon? coupon;
  
  bool showPinModal = false;
  String pin = '';
  String? error;
  bool success = false;
  bool copied = false;
  int? mileage;

  @override
  void initState() {
    super.initState();
    _loadCoupon();
  }

  Future<void> _loadCoupon() async {
    // Simulate network/loading delay
    await Future.delayed(const Duration(milliseconds: 500));
    
    final repo = ref.read(couponRepositoryProvider);
    final loaded = await repo.getCoupon(widget.couponId);
    
    if (mounted) {
      if (loaded != null) {
        setState(() {
          coupon = loaded;
          loading = false;
          if (loaded.status == CouponStatus.USED) {
            success = true;
          }
        });
      } else {
        // If not found, maybe create a MOCK one for MVP testing if ID is "test"
        if (widget.couponId == 'test') {
           _createMockCoupon();
        } else {
           setState(() => loading = false);
        }
      }
    }
  }

  void _createMockCoupon() async {
     final mock = Coupon(
        id: 'test-id-123',
        code: 'TEST-CODE',
        status: CouponStatus.ISSUED,
        createdAt: DateTime.now(),
        storeId: 'store-1',
        storeName: 'Test Store',
        benefit: 'Free Coffee',
        store: CouponStore(name: 'Test Store', benefitText: 'Free Coffee', usageCondition: 'Visit anytime'),
     );
     await ref.read(couponRepositoryProvider).saveCoupon(mock);
     if (mounted) {
       setState(() {
         coupon = mock;
         loading = false;
       });
     }
  }

  void _handlePinSubmit() async {
    if (pin.isEmpty) {
      setState(() => error = 'PIN을 입력해주세요');
      return;
    }

    setState(() => loading = true);
    await Future.delayed(const Duration(milliseconds: 800));

    if (pin == '1234') {
       final repo = ref.read(couponRepositoryProvider);
       await repo.updateCouponStatus(widget.couponId, CouponStatus.USED);
       
       // Reload to get updated timestamp
       final updated = await repo.getCoupon(widget.couponId);

       if (mounted) {
         setState(() {
           coupon = updated;
           success = true;
           mileage = 100;
           loading = false;
         });
         
         Future.delayed(const Duration(milliseconds: 3000), () {
           if (mounted) setState(() => showPinModal = false);
         });
       }
    } else {
      if (mounted) {
        setState(() {
          loading = false;
          error = 'PIN 번호가 올바르지 않습니다 (테스트: 1234)';
        });
      }
    }
  }

  void _handleCopyLink() {
    Clipboard.setData(ClipboardData(text: 'https://story-link-silk.vercel.app/coupon/${widget.couponId}'));
    setState(() => copied = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => copied = false);
    });
  }
  
  String _formatDate(DateTime date) {
    return DateFormat('yyyy년 M월 d일 a h:mm', 'ko').format(date);
  }

  @override
  Widget build(BuildContext context) {
    if (loading && coupon == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (coupon == null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('쿠폰을 찾을 수 없습니다', style: AppTextStyles.heading2),
              const Gap(8),
              Text('잘못된 접근이거나 이미 삭제된 쿠폰입니다.', style: AppTextStyles.bodySmall),
              const Gap(24),
              ElevatedButton(
                onPressed: () => context.go('/'),
                child: const Text('홈으로 돌아가기'),
              ),
            ],
          ),
        ),
      );
    }

    final isUsed = coupon!.status == CouponStatus.USED;
    final isVoid = coupon!.status == CouponStatus.VOID;
    final canUse = coupon!.status == CouponStatus.ISSUED;

    return Scaffold(
      backgroundColor: AppColors.white,
      body: Stack(
        children: [
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Gap(40),
                  // Header
                  Text(
                    success ? '사용 완료!' : (isUsed ? '사용된 쿠폰' : '쿠폰이 생성되었습니다'),
                    style: AppTextStyles.heading1,
                    textAlign: TextAlign.center,
                  ),
                  if (!isUsed && !success) ...[
                    const Gap(8),
                    Text(
                      '이제 이 쿠폰을 사용할 수 있어요!',
                      style: AppTextStyles.base.copyWith(color: AppColors.gray600),
                      textAlign: TextAlign.center,
                    ),
                  ],
                  const Gap(40),
                  
                  // Coupon Card
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(AppRadius.xl),
                      boxShadow: [
                         BoxShadow(
                           color: Colors.black.withOpacity(0.1),
                           blurRadius: 15,
                           offset: const Offset(0, 10),
                         )
                      ],
                      border: Border.all(color: AppColors.gray100),
                    ),
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                         // Link Section
                         Row(
                           mainAxisAlignment: MainAxisAlignment.spaceBetween,
                           children: [
                             const Text('쿠폰 받은 링크', style: AppTextStyles.caption),
                             GestureDetector(
                               onTap: _handleCopyLink,
                               child: Text(
                                 copied ? '복사됨' : '복사', 
                                 style: AppTextStyles.caption.copyWith(fontWeight: FontWeight.bold),
                               ),
                             ),
                           ],
                         ),
                         const Gap(4),
                         Text(
                           'story-link.../coupon/${coupon!.id.substring(0, min(8, coupon!.id.length))}',
                           style: AppTextStyles.bodySmall,
                         ),
                         
                         const Gap(16),
                         Divider(color: AppColors.gray100, thickness: 1),
                         const Gap(16),
                         
                         // Store Info
                         Text(coupon!.storeName, style: AppTextStyles.heading2),
                         const Gap(8),
                         Container(
                           padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                           decoration: BoxDecoration(
                             color: AppColors.gray50,
                             borderRadius: BorderRadius.circular(AppRadius.md),
                           ),
                           child: Row(
                             mainAxisSize: MainAxisSize.min,
                             children: [
                               const Text('혜택', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                               const Gap(8),
                               Text(coupon!.store.benefitText, style: const TextStyle(fontSize: 14)),
                             ],
                           ),
                         ),
                         const Gap(12),
                         Text(
                             coupon!.store.usageCondition, 
                             style: AppTextStyles.bodySmall.copyWith(color: AppColors.gray500)
                         ),
                         
                         const Gap(24),
                         
                         // Status Badges
                         if (isUsed) ...[
                             Container(
                               padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                               decoration: BoxDecoration(
                                 color: AppColors.error.withOpacity(0.1),
                                 borderRadius: BorderRadius.circular(AppRadius.full),
                               ),
                               child: const Text('사용 완료', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.bold, fontSize: 12)),
                             ),
                             if (coupon!.usedAt != null)
                               Padding(
                                 padding: const EdgeInsets.only(top: 8.0),
                                 child: Text('사용일시: ${_formatDate(coupon!.usedAt!)}', style: AppTextStyles.caption),
                               ),
                         ] else if (isVoid) ...[
                             Container(
                               padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                               decoration: BoxDecoration(
                                 color: AppColors.error.withOpacity(0.1),
                                 borderRadius: BorderRadius.circular(AppRadius.full),
                               ),
                               child: const Text('무효화됨', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.bold, fontSize: 12)),
                             ),
                         ] else if (canUse) ...[
                             Container(
                               padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                               decoration: BoxDecoration(
                                 color: Colors.green.withOpacity(0.1),
                                 borderRadius: BorderRadius.circular(AppRadius.full),
                               ),
                               child: const Text('사용 가능', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 12)),
                             ),
                         ],
                         
                         const Gap(24),
                         const Text('쿠폰 코드', style: AppTextStyles.caption),
                         Text(coupon!.code, style: const TextStyle(fontFamily: 'Monospace', fontSize: 16, fontWeight: FontWeight.bold)), // Pretendard/Monospace
                      ],
                    ),
                  ),
                  
                  const Gap(32),
                  
                  // Actions
                  if (!isUsed && !isVoid) ...[
                     OutlinedButton(
                       onPressed: _handleCopyLink,
                       child: const Text('링크 복사하기'),
                     ),
                     const Gap(12),
                     ElevatedButton(
                       onPressed: canUse ? () => setState(() => showPinModal = true) : null,
                       child: const Text('사용하기'),
                     ),
                     const Gap(16),
                     const Text(
                       '직원 확인 후 눌러주세요',
                       style: AppTextStyles.caption,
                       textAlign: TextAlign.center,
                     ),
                  ]
                ],
              ),
            ),
          ),
          
          // PIN Modal Overlay
          if (showPinModal)
            Container(
              color: Colors.black.withOpacity(0.5),
              child: Center(
                child: Container(
                  margin: const EdgeInsets.all(24),
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(AppRadius.xl),
                  ),
                  child: success ? _buildSuccessContent() : _buildPinContent(),
                ),
              ),
            ),
        ],
      ),
    );
  }
  
  Widget _buildPinContent() {
     return Column(
       mainAxisSize: MainAxisSize.min,
       children: [
         const Text('직원 PIN 입력', style: AppTextStyles.heading2),
         const Gap(8),
         const Text('가게 직원에게 PIN을 입력받으세요', style: AppTextStyles.bodySmall, textAlign: TextAlign.center),
         const Gap(24),
         
         TextField(
           autofocus: true,
           obscureText: true,
           keyboardType: TextInputType.number,
           maxLength: 6,
           onChanged: (v) => setState(() => pin = v),
           decoration: InputDecoration(
             helperText: '', // Hide default helper
             hintText: 'PIN 입력',
             filled: true,
             fillColor: AppColors.gray100,
             border: OutlineInputBorder(
               borderRadius: BorderRadius.circular(AppRadius.md),
               borderSide: BorderSide.none,
             ),
             contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
           ),
         ),
         
         if (error != null)
           Text(error!, style: const TextStyle(color: AppColors.error, fontSize: 14)),
           
         const Gap(24),
         
         Row(
           children: [
             Expanded(
               child: OutlinedButton(
                 onPressed: () => setState(() => showPinModal = false),
                 child: const Text('취소'),
               ),
             ),
             const Gap(12),
             Expanded(
               child: ElevatedButton(
                 onPressed: (loading || pin.isEmpty) ? null : _handlePinSubmit,
                 child: loading 
                     ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) 
                     : const Text('확인'),
               ),
             ),
           ],
         )
       ],
     );
  }
  
  Widget _buildSuccessContent() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 50, height: 50,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.green,
          ),
          child: const Icon(Icons.check, color: Colors.white, size: 30),
        ),
        const Gap(16),
        const Text('사용 완료', style: AppTextStyles.heading2),
        if (mileage != null) ...[
           const Gap(12),
           Container(
             padding: const EdgeInsets.all(12),
             decoration: BoxDecoration(
               color: const Color(0xFFF0FDFA),
               borderRadius: BorderRadius.circular(AppRadius.md),
             ),
             child: Text('+$mileage P 마일리지 적립!', style: const TextStyle(color: Color(0xFF0F766E), fontWeight: FontWeight.bold)),
           )
        ],
        const Gap(12),
        const Text('쿠폰이 정상적으로 사용되었습니다', style: AppTextStyles.caption),
      ],
    );
  }
}
