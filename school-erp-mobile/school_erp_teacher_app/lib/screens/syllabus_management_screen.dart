import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:provider/provider.dart';
import 'package:school_erp_mobile_core/school_erp_mobile_core.dart';
import 'dart:convert';
import 'package:intl/intl.dart';

class SyllabusManagementScreen extends StatefulWidget {
  final String courseId;
  final String courseName;

  const SyllabusManagementScreen({
    super.key,
    required this.courseId,
    required this.courseName,
  });

  @override
  State<SyllabusManagementScreen> createState() => _SyllabusManagementScreenState();
}

class _SyllabusManagementScreenState extends State<SyllabusManagementScreen> {
  bool _isLoading = true;
  String? _error;
  List<Map<String, dynamic>> _versions = [];
  bool _isUploading = false;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final res = await ApiClient.get(context, '/courses/${widget.courseId}/syllabus/list');
      if (res.statusCode == 200) {
        if (mounted) setState(() {
          _versions = (json.decode(res.body) as List).cast<Map<String, dynamic>>();
          _isLoading = false;
        });
      } else if (res.statusCode == 404) {
        if (mounted) setState(() {
          _versions = [];
          _isLoading = false;
        });
      } else {
        if (mounted) setState(() { _error = 'Failed to load syllabus history.'; _isLoading = false; });
      }
    } catch (_) {
      if (mounted) setState(() { _error = 'Network connection failed.'; _isLoading = false; });
    }
  }

  Future<void> _uploadNewOrReplace(String? existingSyllabusId) async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
    );
    
    if (result == null || result.files.single.path == null) return;

    setState(() => _isUploading = true);
    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final staffId = auth.user?['staffId'] ?? 'TEACHER_1';
      final userId = auth.user?['id'] ?? 'USER_1';

      final method = existingSyllabusId == null ? 'POST' : 'PUT';
      final pathEnd = existingSyllabusId == null ? '' : '/$existingSyllabusId';

      final res = await ApiClient.multipartRequest(
        context,
        method,
        '/courses/${widget.courseId}/syllabus$pathEnd',
        fileField: 'file',
        filePath: result.files.single.path!,
        fileName: result.files.single.name,
        headers: {
          'X-User-ID': userId,
          'X-Staff-ID': staffId,
          'X-User-Role': 'TEACHER',
        },
      );

      if (res.statusCode == 200 && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Syllabus successfully published.'), backgroundColor: ClayTheme.success));
        _loadHistory();
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Upload failed. Please try again.'), backgroundColor: ClayTheme.danger));
      }
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Network error.'), backgroundColor: ClayTheme.danger));
    } finally {
      if (mounted) setState(() => _isUploading = false);
    }
  }

  Future<void> _openSyllabus(String syllabusId) async {
    try {
      final res = await ApiClient.get(context, '/courses/${widget.courseId}/syllabus/$syllabusId/download');
      if (res.statusCode == 200) {
        final data = json.decode(res.body) as Map<String, dynamic>;
        final url = data['url'];
        if (url != null && mounted) {
           await PdfViewerService.launchRemotePdf(context, url);
        }
      } else {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to open PDF.'), backgroundColor: ClayTheme.danger));
      }
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Network error.'), backgroundColor: ClayTheme.danger));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Manage Syllabus'), backgroundColor: Colors.transparent, elevation: 0),
      floatingActionButton: _isUploading
          ? const FloatingActionButton(onPressed: null, backgroundColor: Colors.grey, child: CircularProgressIndicator(color: Colors.white))
          : FloatingActionButton.extended(
              onPressed: () => _uploadNewOrReplace(null),
              backgroundColor: ClayTheme.primary,
              icon: const Icon(Icons.upload_file, color: Colors.white),
              label: const Text('New Version', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Text(widget.courseName, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 20),
            child: Text('Upload or replace official course syllabus PDFs.', style: TextStyle(color: ClayTheme.textLight)),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: Builder(
              builder: (ctx) {
                if (_isLoading) return const Center(child: CircularProgressIndicator());
                if (_error != null) return ClayErrorState(message: _error!, onRetry: _loadHistory);
                if (_versions.isEmpty) return const ClayEmptyState(title: 'No Syllabus', message: 'There is no syllabus document assigned yet.', icon: Icons.description);

                return ListView.builder(
                  padding: const EdgeInsets.all(20),
                  itemCount: _versions.length,
                  itemBuilder: (ctx, idx) {
                    final v = _versions[idx];
                    final isLatest = idx == 0;
                    DateTime? cAt;
                    try { cAt = DateTime.parse(v['createdAt']); } catch (_) {}
                    final dateStr = cAt != null ? DateFormat('MMM dd, yyyy').format(cAt) : 'Unknown Date';

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: ClayCard(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Icon(Icons.picture_as_pdf, color: isLatest ? Colors.redAccent : Colors.grey, size: 36),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Text('Version ${v['version']}', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: isLatest ? ClayTheme.textDark : Colors.grey)),
                                          if (isLatest) ...[
                                            const SizedBox(width: 8),
                                            const ClayStatusChip(label: 'LATEST', color: ClayTheme.success),
                                          ]
                                        ],
                                      ),
                                      const SizedBox(height: 4),
                                      Text(v['fileName'] ?? 'document.pdf', style: TextStyle(color: isLatest ? ClayTheme.textLight : Colors.grey.shade400, fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis),
                                      const SizedBox(height: 2),
                                      Text(dateStr, style: const TextStyle(color: Colors.grey, fontSize: 10)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                TextButton.icon(
                                  onPressed: () => _uploadNewOrReplace(v['id']),
                                  icon: const Icon(Icons.autorenew, color: ClayTheme.warning, size: 18),
                                  label: const Text('Replace', style: TextStyle(color: ClayTheme.warning, fontWeight: FontWeight.bold)),
                                ),
                                const SizedBox(width: 8),
                                ClayButton(
                                  onPressed: () => _openSyllabus(v['id']),
                                  child: const Text('OPEN PDF', style: TextStyle(fontSize: 12)),
                                ),
                              ],
                            )
                          ],
                        ),
                      ),
                    );
                  },
                );
              }
            )
          ),
        ],
      )
    );
  }
}
