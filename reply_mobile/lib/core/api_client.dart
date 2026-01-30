import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// The base URL of the deployed Next.js app
const String kBaseUrl = 'https://story-link-silk.vercel.app';

final dioProvider = Provider((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: kBaseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));
  
  // Add logging interceptor if needed
  return dio;
});
