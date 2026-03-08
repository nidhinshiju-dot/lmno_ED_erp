import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import 'package:flutter/material.dart';
import '../providers/auth_provider.dart';
import '../core/api_config.dart';

class ApiClient {
  static Map<String, String> _headers(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final token = auth.token;
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<http.Response> get(BuildContext context, String path) async {
    return await http.get(
      Uri.parse('${ApiConfig.baseUrl}$path'),
      headers: _headers(context),
    );
  }

  static Future<http.Response> post(BuildContext context, String path, {String? body}) async {
    return await http.post(
      Uri.parse('${ApiConfig.baseUrl}$path'),
      headers: _headers(context),
      body: body,
    );
  }
}
