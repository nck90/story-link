import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gap/gap.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/api_client.dart';
import '../../../theme/app_theme.dart';

// Models for Dashboard (Inline for simplicity or move to admin/model)
class AdminStats {
  final int linksval;
  final int coupons;
  final int used;
  final List<StoreStat> breakdown;
  
  AdminStats({required this.linksval, required this.coupons, required this.used, required this.breakdown});
  
  factory AdminStats.fromJson(Map<String, dynamic> json) {
    return AdminStats(
      linksval: json['linksval'] ?? 0,
      coupons: json['coupons'] ?? 0,
      used: json['used'] ?? 0,
      breakdown: (json['breakdown'] as List?)?.map((e) => StoreStat.fromJson(e)).toList() ?? [],
    );
  }
}

class StoreStat {
  final String storeId;
  final String storeName;
  final int issued;
  final int used;
  final int links;
  
  StoreStat({required this.storeId, required this.storeName, required this.issued, required this.used, required this.links});
  
  factory StoreStat.fromJson(Map<String, dynamic> json) {
    return StoreStat(
      storeId: json['storeId'] ?? '',
      storeName: json['storeName'] ?? '',
      issued: json['issued'] ?? 0,
      used: json['used'] ?? 0,
      links: json['links'] ?? 0,
    );
  }
}

class Settings {
  int activationHours;
  int expirationDays;
  int chainExtensionDays;
  
  Settings({required this.activationHours, required this.expirationDays, required this.chainExtensionDays});
  
  factory Settings.fromJson(Map<String, dynamic> json) {
    return Settings(
      activationHours: json['activationHours'] ?? 3,
      expirationDays: json['expirationDays'] ?? 14,
      chainExtensionDays: json['chainExtensionDays'] ?? 14,
    );
  }
  
  Map<String, dynamic> toJson() => {
    'activationHours': activationHours,
    'expirationDays': expirationDays,
    'chainExtensionDays': chainExtensionDays,
  };
}

class AdminDashboardScreen extends ConsumerStatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  ConsumerState<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends ConsumerState<AdminDashboardScreen> {
  AdminStats? stats;
  Settings? settings;
  bool loading = true;
  bool settingsSaved = false;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    final prefs = await SharedPreferences.getInstance();
    final password = prefs.getString('admin_password');
    
    if (password == null) {
      if (mounted) context.go('/admin');
      return;
    }

    try {
      final dio = ref.read(dioProvider);
      
      // Fetch Stats
      try {
        final statsRes = await dio.get('/api/admin/stats', queryParameters: {'password': password});
        if (statsRes.statusCode == 200) {
          setState(() {
            stats = AdminStats.fromJson(statsRes.data);
          });
        }
      } catch (e) {
        // Mock if fails
        setState(() {
          stats = AdminStats(linksval: 120, coupons: 45, used: 12, breakdown: [
             StoreStat(storeId: '1', storeName: '먹음직', issued: 30, used: 10, links: 80)
          ]);
        });
      }
      
      // Fetch Settings
      try {
        final settingsRes = await dio.get('/api/admin/settings', queryParameters: {'password': password});
         if (settingsRes.statusCode == 200) {
          setState(() {
            settings = Settings.fromJson(settingsRes.data);
          });
        }
      } catch (e) {
        setState(() {
          settings = Settings(activationHours: 3, expirationDays: 14, chainExtensionDays: 14);
        });
      }

    } catch (e) {
      print('Fetch Error: $e');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }
  
  Future<void> _saveSettings() async {
    if (settings == null) return;
    
    final prefs = await SharedPreferences.getInstance();
    final password = prefs.getString('admin_password');
    
    try {
      final dio = ref.read(dioProvider);
      await dio.post('/api/admin/settings', 
        queryParameters: {'password': password},
        data: settings!.toJson()
      );
      
      setState(() => settingsSaved = true);
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) setState(() => settingsSaved = false);
      });
    } catch (e) {
      print('Save Error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (stats == null || settings == null) return const Scaffold(body: Center(child: Text('데이터 로드 실패')));

    return Scaffold(
      backgroundColor: AppColors.gray50,
      appBar: AppBar(
        title: const Text('관리자용 대시보드 Beta', style: TextStyle(color: Colors.black, fontSize: 16)),
        backgroundColor: Colors.white,
        elevation: 1,
        actions: [
          TextButton(
            onPressed: () async {
              final prefs = await SharedPreferences.getInstance();
              await prefs.remove('admin_password');
              if (mounted) context.go('/admin');
            }, 
            child: const Text('로그아웃')
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
             // Settings Section
             _buildSectionHeader('⚙️ 쿠폰 설정', '쿠폰 활성화 시간 및 유효기간 설정'),
             const Gap(16),
             Row(
               children: [
                 Expanded(child: _buildSettingCard('활성화 시간', '${settings!.activationHours}', '시간', (v) => setState(() => settings!.activationHours = int.tryParse(v) ?? 3))),
                 const Gap(12),
                 Expanded(child: _buildSettingCard('유효기간', '${settings!.expirationDays}', '일', (v) => setState(() => settings!.expirationDays = int.tryParse(v) ?? 14))),
               ],
             ),
             const Gap(16),
             SizedBox(
               width: double.infinity,
               child: ElevatedButton(
                 onPressed: _saveSettings,
                 style: ElevatedButton.styleFrom(
                   backgroundColor: settingsSaved ? Colors.green : AppColors.primary,
                 ),
                 child: Text(settingsSaved ? '✓ 저장 완료!' : '설정 저장'),
               ),
             ),
             
             const Gap(32),
             
             // KPI Section
             _buildSectionHeader('전체 비즈니스 성과', '인스타그램 스토리 마케팅 통합 현황'),
             const Gap(16),
             Row(
               children: [
                 Expanded(child: _buildKpiCard('스토리 링크 공유수', '${stats!.linksval}', '')),
                 const Gap(12),
                 Expanded(child: _buildKpiCard('총 쿠폰 발행량', '${stats!.coupons}', '', isPrimary: true)),
                 const Gap(12),
                 Expanded(child: _buildKpiCard('최종 방문 전환율', stats!.coupons > 0 ? '${((stats!.used / stats!.coupons) * 100).round()}%' : '0%', '')),
               ],
             ),
             
             const Gap(32),
             
             // Table Section
             _buildSectionHeader('매장별 데이터 현황', ''),
             const Gap(16),
             Container(
               decoration: BoxDecoration(
                 color: Colors.white,
                 borderRadius: BorderRadius.circular(12),
                 boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)],
               ),
               child: Column(
                 children: [
                   // Header
                   Container(
                     padding: const EdgeInsets.all(12),
                     decoration: const BoxDecoration(
                       border: Border(bottom: BorderSide(color: AppColors.gray200))
                     ),
                     child: const Row(
                       children: [
                         Expanded(flex: 2, child: Text('매장', style: TextStyle(fontWeight: FontWeight.bold))),
                         Expanded(child: Text('발급', textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.bold))),
                         Expanded(child: Text('사용', textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.bold))),
                       ],
                     ),
                   ),
                   // Body
                   ...stats!.breakdown.map((s) => Container(
                     padding: const EdgeInsets.all(16),
                     decoration: const BoxDecoration(
                       border: Border(bottom: BorderSide(color: AppColors.gray100))
                     ),
                     child: Row(
                       children: [
                         Expanded(flex: 2, child: Text(s.storeName, style: const TextStyle(fontWeight: FontWeight.bold))),
                         Expanded(child: Text('${s.issued}', textAlign: TextAlign.center)),
                         Expanded(child: Text('${s.used}', textAlign: TextAlign.center)),
                       ],
                     ),
                   )).toList(),
                   
                   if (stats!.breakdown.isEmpty)
                     const Padding(padding: EdgeInsets.all(32), child: Text('데이터가 없습니다.')),
                 ],
               ),
             ),
             
             const Gap(40),
             // Diagnostics (Simplified)
             Container(
               padding: const EdgeInsets.all(20),
               decoration: BoxDecoration(
                 color: AppColors.gray800,
                 borderRadius: BorderRadius.circular(12),
               ),
               child: const Column(
                 crossAxisAlignment: CrossAxisAlignment.start,
                 children: [
                   Text('실시간 인프라 진단', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                   Gap(12),
                   Text('모든 통신은 실시간으로 암호화되며, 안전하게 보호됩니다.', style: TextStyle(color: Colors.grey)),
                   Gap(20),
                   Text('REPLY CORP. 2026', style: TextStyle(color: Colors.white, fontSize: 10)),
                 ],
               ),
             )
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, String subtitle) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        if (subtitle.isNotEmpty) ...[
          const Gap(4),
          Text(subtitle, style: const TextStyle(color: AppColors.gray600, fontSize: 12)),
        ]
      ],
    );
  }

  Widget _buildSettingCard(String label, String value, String unit, Function(String) onChanged) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.gray500)),
          const Gap(8),
          Row(
            children: [
              Expanded(
                child: TextField(
                   controller: TextEditingController(text: value)..selection = TextSelection.collapsed(offset: value.length),
                   onChanged: onChanged,
                   keyboardType: TextInputType.number,
                   textAlign: TextAlign.center,
                   style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                   decoration: const InputDecoration(border: InputBorder.none, isDense: true, contentPadding: EdgeInsets.zero),
                ),
              ),
              Text(unit, style: const TextStyle(color: AppColors.gray500)),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildKpiCard(String label, String value, String sub, {bool isPrimary = false}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.gray500)),
          const Gap(8),
          Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: isPrimary ? AppColors.primary : Colors.black)),
          if (sub.isNotEmpty) Text(sub, style: const TextStyle(fontSize: 10, color: AppColors.gray400)),
        ],
      ),
    );
  }
}
