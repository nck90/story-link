class CouponStore {
  final String name;
  final String benefitText;
  final String usageCondition;

  CouponStore({
    required this.name,
    required this.benefitText,
    required this.usageCondition,
  });

  factory CouponStore.fromJson(Map<String, dynamic> json) {
    return CouponStore(
      name: json['name'] as String,
      benefitText: json['benefitText'] as String,
      usageCondition: json['usageCondition'] as String? ?? '직원에게 문의해주세요',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'benefitText': benefitText,
      'usageCondition': usageCondition,
    };
  }
}

enum CouponStatus { ISSUED, USED, VOID }

class Coupon {
  final String id;
  final String code;
  final CouponStatus status;
  final DateTime createdAt;
  final DateTime? usedAt;
  final String storeId;
  final String storeName;
  final String benefit;
  final CouponStore store;

  Coupon({
    required this.id,
    required this.code,
    required this.status,
    required this.createdAt,
    this.usedAt,
    required this.storeId,
    required this.storeName,
    required this.benefit,
    required this.store,
  });

  factory Coupon.fromJson(Map<String, dynamic> json) {
    return Coupon(
      id: json['id'] as String,
      code: json['code'] as String,
      status: CouponStatus.values.firstWhere(
        (e) => e.toString().split('.').last == json['status'],
        orElse: () => CouponStatus.ISSUED,
      ),
      createdAt: DateTime.parse(json['createdAt'] as String),
      usedAt: json['usedAt'] != null ? DateTime.parse(json['usedAt'] as String) : null,
      storeId: json['storeId'] as String,
      storeName: json['storeName'] as String,
      benefit: json['benefit'] as String,
      store: CouponStore.fromJson(json['store'] as Map<String, dynamic>),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'status': status.toString().split('.').last,
      'createdAt': createdAt.toIso8601String(),
      'usedAt': usedAt?.toIso8601String(),
      'storeId': storeId,
      'storeName': storeName,
      'benefit': benefit,
      'store': store.toJson(),
    };
  }
  
  Coupon copyWith({
    String? id,
    String? code,
    CouponStatus? status,
    DateTime? createdAt,
    DateTime? usedAt,
    String? storeId,
    String? storeName,
    String? benefit,
    CouponStore? store,
  }) {
    return Coupon(
      id: id ?? this.id,
      code: code ?? this.code,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      usedAt: usedAt ?? this.usedAt,
      storeId: storeId ?? this.storeId,
      storeName: storeName ?? this.storeName,
      benefit: benefit ?? this.benefit,
      store: store ?? this.store,
    );
  }
}
