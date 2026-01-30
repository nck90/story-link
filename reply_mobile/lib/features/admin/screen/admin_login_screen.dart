import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gap/gap.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/api_client.dart';
import '../../../theme/app_theme.dart';

class AdminLoginScreen extends ConsumerStatefulWidget {
  const AdminLoginScreen({super.key});

  @override
  ConsumerState<AdminLoginScreen> createState() => _AdminLoginScreenState();
}

class _AdminLoginScreenState extends ConsumerState<AdminLoginScreen> {
  final _passwordController = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _handleSubmit() async {
    final password = _passwordController.text;
    if (password.isEmpty) return;

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final dio = ref.read(dioProvider);
      // Verify password by trying to fetch stats
      final res = await dio.get('/api/admin/stats', queryParameters: {'password': password});
      
      if (res.statusCode == 200) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('admin_password', password);
        
        if (mounted) {
          context.go('/admin/dashboard');
        }
      } else {
        setState(() => _error = 'Invalid Access Key');
      }
    } catch (e) {
       print('Login Error: $e');
       // Mock login for demo if server fails
       if (password == 'admin') {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('admin_password', password);
          if (mounted) context.go('/admin/dashboard');
       } else {
          setState(() => _error = 'System Error or Invalid Key');
       }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black, // Dark theme for Admin Login based on CSS .container bg color override or similar
      body: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 400),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
               const Icon(Icons.admin_panel_settings, size: 48, color: Colors.white),
               const Gap(24),
               const Text('Admin Access', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
               const Text('Reply Management Portal', style: TextStyle(color: Colors.grey, fontSize: 14)),
               const Gap(40),
               
               TextField(
                 controller: _passwordController,
                 obscureText: true,
                 style: const TextStyle(color: Colors.white),
                 decoration: InputDecoration(
                   filled: true,
                   fillColor: Colors.white.withOpacity(0.1),
                   hintText: 'Security Key',
                   hintStyle: TextStyle(color: Colors.white.withOpacity(0.5)),
                   border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                   prefixIcon: const Icon(Icons.key, color: Colors.grey),
                 ),
               ),
               
               if (_error != null)
                 Padding(
                   padding: const EdgeInsets.only(top: 16),
                   child: Text(_error!, style: const TextStyle(color: AppColors.error)),
                 ),
                 
               const Gap(24),
               
               SizedBox(
                 width: double.infinity,
                 child: ElevatedButton(
                   onPressed: _loading ? null : _handleSubmit,
                   style: ElevatedButton.styleFrom(
                     backgroundColor: AppColors.primary,
                     foregroundColor: Colors.white,
                     padding: const EdgeInsets.symmetric(vertical: 16),
                   ),
                   child: _loading ? const CircularProgressIndicator(color: Colors.white) : const Text('Authorize Session'),
                 ),
               ),
               
               const Gap(40),
               const Text('Authorized Personnel Only', style: TextStyle(color: Colors.grey, fontSize: 12)),
            ],
          ),
        ),
      ),
    );
  }
}
