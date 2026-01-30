import 'dart:math';

class Utils {
  static const _chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
  static final Random _rnd = Random();

  static String generateShortId([int length = 6]) {
    return String.fromCharCodes(Iterable.generate(
        length, (_) => _chars.codeUnitAt(_rnd.nextInt(_chars.length))));
  }

  static String generateCouponCode(String storePrefix) {
    final suffix = generateShortId(4).toUpperCase();
    return '$storePrefix-$suffix';
  }
}
