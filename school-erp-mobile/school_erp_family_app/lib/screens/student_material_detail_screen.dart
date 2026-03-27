import 'package:flutter/material.dart';
import 'package:school_erp_mobile_core/school_erp_mobile_core.dart';
import 'dart:convert';
import 'package:intl/intl.dart';

class StudentMaterialDetailScreen extends StatefulWidget {
  final String courseId;
  final String materialId;
  final String initialTitle;

  const StudentMaterialDetailScreen({
    super.key,
    required this.courseId,
    required this.materialId,
    required this.initialTitle,
  });

  @override
  State<StudentMaterialDetailScreen> createState() => _StudentMaterialDetailScreenState();
}

class _StudentMaterialDetailScreenState extends State<StudentMaterialDetailScreen> {
  bool _isLoading = true;
  String? _error;
  Map<String, dynamic>? _material;

  @override
  void initState() {
    super.initState();
    _loadMaterial();
  }

  Future<void> _loadMaterial() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final res = await ApiClient.get(context, '/courses/${widget.courseId}/materials/${widget.materialId}');
      if (res.statusCode == 200) {
        if (mounted) setState(() {
          _material = json.decode(res.body);
          _isLoading = false;
        });
      } else {
        if (mounted) setState(() { _error = 'Failed to load material'; _isLoading = false; });
      }
    } catch (_) {
      if (mounted) setState(() { _error = 'Network connection failed.'; _isLoading = false; });
    }
  }

  Future<void> _openMaterial() async {
    try {
      final res = await ApiClient.get(context, '/courses/${widget.courseId}/materials/${widget.materialId}/download');
      if (res.statusCode == 200) {
        final url = json.decode(res.body)['url'];
        if (url != null && mounted) {
           await PdfViewerService.launchRemotePdf(context, url);
        }
      } else {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to open document'), backgroundColor: ClayTheme.danger));
      }
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Network error'), backgroundColor: ClayTheme.danger));
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_error != null) return Scaffold(appBar: AppBar(title: Text(widget.initialTitle), backgroundColor: Colors.transparent, elevation: 0), body: ClayErrorState(message: _error!, onRetry: _loadMaterial));
    if (_material == null) return const Scaffold(body: Center(child: Text('Not found')));

    DateTime? cAt;
    try { cAt = DateTime.parse(_material!['createdAt']); } catch (_) {}
    final dateStr = cAt != null ? DateFormat('MMM dd, yyyy').format(cAt) : 'Unknown';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Material Details'), 
        backgroundColor: Colors.transparent, 
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClayContainer(
              padding: const EdgeInsets.all(24),
              depth: true,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.picture_as_pdf, color: Colors.blueAccent, size: 48),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(_material!['title'] ?? 'Document', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
                            const SizedBox(height: 4),
                            Text(_material!['fileName'] ?? '', style: const TextStyle(color: ClayTheme.textLight, fontSize: 14)),
                            const SizedBox(height: 4),
                            ClayStatusChip(label: 'Uploaded $dateStr', color: ClayTheme.success),
                          ],
                        ),
                      )
                    ],
                  ),
                  const SizedBox(height: 24),
                  if (_material!['description'] != null && _material!['description'].toString().isNotEmpty) ...[
                    const Text('Description', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: ClayTheme.textLight)),
                    const SizedBox(height: 8),
                    Text(_material!['description'], style: const TextStyle(fontSize: 16, color: ClayTheme.textDark, height: 1.5)),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ClayButton(
                onPressed: _openMaterial,
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.download, color: Colors.white, size: 20),
                    SizedBox(width: 8),
                    Text('OPEN / DOWNLOAD', style: TextStyle(fontSize: 16)),
                  ],
                )
              ),
            ),
          ],
        ),
      ),
    );
  }
}
