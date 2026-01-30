import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'theme/app_theme.dart';
import 'features/home/screen/landing_screen.dart';
import 'features/coupon/screen/coupon_screen.dart';
import 'features/scanner/screen/scan_screen.dart';
import 'features/store/screen/store_screen.dart';
import 'features/admin/screen/admin_login_screen.dart';
import 'features/admin/screen/admin_dashboard_screen.dart';

void main() {
  runApp(const ProviderScope(child: ReplyApp()));
}

final _router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const LandingScreen(),
    ),
    GoRoute(
      path: '/scan',
      builder: (context, state) => const ScanScreen(),
    ),
    GoRoute(
      path: '/coupon/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return CouponScreen(couponId: id);
      },
    ),
    GoRoute(
      path: '/store/:slug',
      builder: (context, state) {
        final slug = state.pathParameters['slug']!;
        // Optional params
        final source = state.uri.queryParameters['source'];
        final linkId = state.uri.queryParameters['link'];
        return StoreScreen(storeSlug: slug, source: source, linkId: linkId);
      },
    ),
    GoRoute(
      path: '/admin',
      builder: (context, state) => const AdminLoginScreen(),
    ),
    GoRoute(
      path: '/admin/dashboard',
      builder: (context, state) => const AdminDashboardScreen(),
    ),
  ],
);

class ReplyApp extends StatelessWidget {
  const ReplyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Reply',
      theme: AppTheme.lightTheme,
      routerConfig: _router,
      debugShowCheckedModeBanner: false,
    );
  }
}
