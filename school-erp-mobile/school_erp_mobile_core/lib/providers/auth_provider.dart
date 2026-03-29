import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/api_config.dart';

class AuthProvider extends ChangeNotifier {
  String? _token;
  String _role = 'STUDENT'; // STUDENT, PARENT, ADMIN
  bool _isLoading = false;

  bool get isAuthenticated => _token != null;
  bool get isLoading => _isLoading;
  String? get token => _token;
  String get role => _role;
  bool get isParent => _role == 'PARENT';
  bool get isStudent => _role == 'STUDENT';

  Future<bool> tryAutoLogin() async {
    final prefs = await SharedPreferences.getInstance();
    if (!prefs.containsKey('erp_token')) {
      return false;
    }
    _token = prefs.getString('erp_token');
    _role = prefs.getString('erp_role') ?? 'STUDENT';
    notifyListeners();
    return true;
  }

  Future<void> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'email': email, 'password': password}),
      );

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        _token = responseData['token'];
        _role = responseData['role'] ?? 'STUDENT';
        
        final prefs = await SharedPreferences.getInstance();
        prefs.setString('erp_token', _token!);
        prefs.setString('erp_role', _role);
        
        _isLoading = false;
        notifyListeners();
      } else {
        _isLoading = false;
        notifyListeners();
        throw Exception('Invalid credentials');
      }
    } catch (error) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  Future<void> logout() async {
    _token = null;
    _role = 'STUDENT';
    final prefs = await SharedPreferences.getInstance();
    prefs.remove('erp_token');
    prefs.remove('erp_role');
    notifyListeners();
  }
}
