import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFFFF4F00);
  static const Color primaryDark = Color(0xFFCC3F00);
  
  static const Color black = Color(0xFF1A1A1A);
  static const Color white = Color(0xFFFFFFFF);
  
  static const Color gray50 = Color(0xFFF9FAFB);
  static const Color gray100 = Color(0xFFF3F4F6);
  static const Color gray200 = Color(0xFFE5E7EB);
  static const Color gray300 = Color(0xFFD1D5DB);
  static const Color gray400 = Color(0xFF9CA3AF);
  static const Color gray500 = Color(0xFF6B7280);
  static const Color gray600 = Color(0xFF4B5563);
  static const Color gray800 = Color(0xFF1F2937);

  static const Color error = Color(0xFFEF4444);
}

class AppTextStyles {
  // Using default font (Roboto on Android, SF on iOS) as placeholder for Pretendard
  // In a real app we'd load 'Pretendard' via google_fonts or assets.
  
  static const TextStyle base = TextStyle(
    fontSize: 16,
    color: AppColors.black,
    height: 1.5,
  );

  static const TextStyle heading1 = TextStyle(
    fontSize: 24, // 1.5rem
    fontWeight: FontWeight.bold,
    color: AppColors.black,
    height: 1.2,
  );

  static const TextStyle heading2 = TextStyle(
    fontSize: 20, // 1.25rem
    fontWeight: FontWeight.bold,
    color: AppColors.black,
  );

  static const TextStyle bodySmall = TextStyle(
    fontSize: 14, // 0.875rem
    color: AppColors.gray600,
  );
  
  static const TextStyle caption = TextStyle(
    fontSize: 12, // 0.75rem
    color: AppColors.gray500,
  );
}

class AppRadius {
  static const double sm = 6.0;
  static const double md = 8.0;
  static const double lg = 12.0;
  static const double xl = 16.0;
  static const double xxl = 24.0;
  static const double full = 9999.0;
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.white,
      fontFamily: 'Roboto', // Default fallback
      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        secondary: AppColors.black,
        surface: AppColors.white,
        error: AppColors.error,
        onPrimary: AppColors.white,
        onSecondary: AppColors.white,
        onSurface: AppColors.black,
        onError: AppColors.white,
      ),
      useMaterial3: true,
      
      // Button Styles
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.black,
          foregroundColor: AppColors.white,
          textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.xl),
          ),
          elevation: 0,
        ),
      ),
      
      // Secondary Button (using OutlinedButton or specific style)
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          backgroundColor: AppColors.gray100,
          foregroundColor: AppColors.gray800,
          side: BorderSide.none,
          textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
           padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.xl),
          ),
        ),
      ),
    );
  }
}
