import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import 'api_config.dart';

class ApiClient {
  static Map<String, String> _headers(BuildContext context, [Map<String, String>? extra]) {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final token = auth.token;
    final headers = {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
    if (extra != null) headers.addAll(extra);
    return headers;
  }

  static void _handleResponse(BuildContext context, http.Response response) {
    if (response.statusCode == 401 || response.statusCode == 403) {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      if (auth.isAuthenticated) {
        auth.logout().then((_) {
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Session expired. Please log in again.'), backgroundColor: Colors.red),
            );
            context.go('/splash');
          }
        });
      }
    }
  }

  static Future<http.Response> get(BuildContext context, String path, {Map<String, String>? headers}) async {
    final res = await http.get(Uri.parse('${ApiConfig.baseUrl}$path'), headers: _headers(context, headers));
    _handleResponse(context, res);
    return res;
  }

  static Future<http.Response> post(BuildContext context, String path, dynamic body, {Map<String, String>? headers}) async {
    final res = await http.post(
      Uri.parse('${ApiConfig.baseUrl}$path'),
      headers: _headers(context, headers),
      body: body is String ? body : json.encode(body),
    );
    _handleResponse(context, res);
    return res;
  }

  static Future<http.Response> put(BuildContext context, String path, dynamic body, {Map<String, String>? headers}) async {
    final res = await http.put(
      Uri.parse('${ApiConfig.baseUrl}$path'),
      headers: _headers(context, headers),
      body: body is String ? body : json.encode(body),
    );
    _handleResponse(context, res);
    return res;
  }

  static Future<http.Response> patch(BuildContext context, String path, dynamic body, {Map<String, String>? headers}) async {
    final res = await http.patch(
      Uri.parse('${ApiConfig.baseUrl}$path'),
      headers: _headers(context, headers),
      body: body is String ? body : json.encode(body),
    );
    _handleResponse(context, res);
    return res;
  }

  static Future<http.Response> delete(BuildContext context, String path, {Map<String, String>? headers}) async {
    final res = await http.delete(Uri.parse('${ApiConfig.baseUrl}$path'), headers: _headers(context, headers));
    _handleResponse(context, res);
    return res;
  }

  static Future<http.Response> multipartRequest(
      BuildContext context,
      String method,
      String path, {
      required String fileField,
      required String filePath,
      required String fileName,
      Map<String, String>? fields,
      Map<String, String>? headers,
  }) async {
    final request = http.MultipartRequest(method, Uri.parse('${ApiConfig.baseUrl}$path'));
    
    // Auth headers
    final baseHeaders = _headers(context, headers);
    // Remove content-type so MultipartRequest can generate its boundary string
    baseHeaders.remove('Content-Type');
    request.headers.addAll(baseHeaders);

    if (fields != null) request.fields.addAll(fields);

    try {
        final file = await http.MultipartFile.fromPath(fileField, filePath, filename: fileName);
        request.files.add(file);
    } catch (e) {
        throw Exception("Failed to attach file: $e");
    }

    final streamResponse = await request.send();
    final res = await http.Response.fromStream(streamResponse);
    _handleResponse(context, res);
    return res;
  }
}
