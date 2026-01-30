import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:gap/gap.dart';
import '../../../theme/app_theme.dart';
import 'dart:async';

class LandingScreen extends StatefulWidget {
  const LandingScreen({super.key});

  @override
  State<LandingScreen> createState() => _LandingScreenState();
}

class _LandingScreenState extends State<LandingScreen> {
  int _logoClicks = 0;
  Timer? _resetTimer;

  void _handleLogoTap() {
    setState(() {
      _logoClicks++;
    });

    _resetTimer?.cancel();
    _resetTimer = Timer(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _logoClicks = 0;
        });
      }
    });

    if (_logoClicks >= 3) {
      _resetTimer?.cancel();
      context.push('/admin');
      setState(() {
        _logoClicks = 0;
      });
    }
  }

  @override
  void dispose() {
    _resetTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      body: Center(
        child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: Column(
              children: [
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      GestureDetector(
                        onTap: _handleLogoTap,
                        behavior: HitTestBehavior.opaque,
                        child: Text(
                          'Reply',
                          style: AppTextStyles.heading1.copyWith(
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                            letterSpacing: -1,
                          ),
                        ),
                      ),
                      const Gap(16),
                      Text(
                        '친구들이 다녀간 맛집,\n스토리에서 바로 확인하세요',
                        style: AppTextStyles.base.copyWith(
                            fontSize: 18, color: AppColors.gray600),
                        textAlign: TextAlign.center,
                      ),
                      const Gap(40),
                      // Visual Placeholder (Circles)
                      SizedBox(
                        height: 200,
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            Container(
                              width: 150,
                              height: 150,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppColors.gray100,
                              ),
                            ),
                            Positioned(
                              top: 20,
                              right: 20,
                              child: Container(
                                width: 80,
                                height: 80,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: AppColors.primary.withOpacity(0.2), // withValues in newer flutter
                                ),
                              ),
                            ),
                          ],
                        ),
                      )
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                       const Text('지금 체험해보세요', style: TextStyle(color: AppColors.gray500, fontWeight: FontWeight.bold)),
                       const Gap(16),
                       SizedBox(
                         width: double.infinity,
                         child: ElevatedButton(
                           onPressed: () => context.push('/store/pasta'), // Hardcoded pasta link for now
                           child: const Text('먹음직 온천천점 방문하기'),
                         ),
                       ),
                       const Gap(12),
                       TextButton.icon(
                         onPressed: () => context.push('/scan'),
                         icon: const Icon(Icons.qr_code_scanner, size: 16),
                         label: const Text('QR 스캔하기', style: TextStyle(fontSize: 14)),
                         style: TextButton.styleFrom(foregroundColor: AppColors.gray600),
                       )
                    ],
                  ),
                )
              ],
            )),
      ),
    );
  }
}
