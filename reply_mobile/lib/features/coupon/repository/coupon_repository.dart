import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../model/coupon.dart';

class CouponRepository {
  static const String _prefix = 'coupon_';

  Future<void> saveCoupon(Coupon coupon) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('$_prefix${coupon.id}', jsonEncode(coupon.toJson()));
  }

  Future<Coupon?> getCoupon(String id) async {
    final prefs = await SharedPreferences.getInstance();
    final String? data = prefs.getString('$_prefix$id');
    if (data == null) return null;
    
    try {
      return Coupon.fromJson(jsonDecode(data));
    } catch (e) {
      // print('Error decoding coupon: $e');
      return null;
    }
  }

  Future<void> updateCouponStatus(String id, CouponStatus status) async {
    final coupon = await getCoupon(id);
    if (coupon != null) {
      final updated = coupon.copyWith(
        status: status,
        usedAt: status == CouponStatus.USED ? DateTime.now() : null,
      );
      await saveCoupon(updated);
    }
  }
}

final couponRepositoryProvider = Provider((ref) => CouponRepository());
