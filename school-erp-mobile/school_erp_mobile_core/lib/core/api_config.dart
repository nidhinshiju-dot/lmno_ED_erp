import 'dart:io';
import 'package:flutter/foundation.dart';

class ApiConfig {
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:8080/api/v1';
    }
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:8080/api/v1'; // Emulator loopback
    } else if (Platform.isIOS) {
      return 'http://127.0.0.1:8080/api/v1'; // Simulator
    }
    return 'http://localhost:8080/api/v1';
  }
}
