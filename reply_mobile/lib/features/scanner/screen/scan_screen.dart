import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../../theme/app_theme.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  final MobileScannerController controller = MobileScannerController();
  bool _isProcessing = false;

  void _handleBarcode(BarcodeCapture capture) {
    if (_isProcessing) return;
    
    final List<Barcode> barcodes = capture.barcodes;
    for (final barcode in barcodes) {
      if (barcode.rawValue != null) {
        final String code = barcode.rawValue!;
        // Expected URL format: https://.../coupon/{id}
        if (code.contains('/coupon/')) {
           setState(() => _isProcessing = true);
           
           final uri = Uri.parse(code);
           // Simple parsing logic
           // If url is .../coupon/1234, pathSegments.last is 1234
           final segments = uri.pathSegments;
           final couponIndex = segments.indexOf('coupon');
           
           if (couponIndex != -1 && couponIndex + 1 < segments.length) {
              final couponId = segments[couponIndex + 1];
              context.go('/coupon/$couponId');
              return;
           }
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('QR 스캔'), backgroundColor: Colors.transparent, elevation: 0),
      extendBodyBehindAppBar: true,
      body: Stack(
        children: [
          MobileScanner(
            controller: controller,
            onDetect: _handleBarcode,
          ),
          
          // Overlay guide
          Center(
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.primary, width: 3),
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ),
          
          Positioned(
            bottom: 50,
            left: 0,
            right: 0,
            child: const Text(
              '쿠폰 QR 코드를 스캔하세요',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
            ),
          )
        ],
      ),
    );
  }
  
  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }
}
