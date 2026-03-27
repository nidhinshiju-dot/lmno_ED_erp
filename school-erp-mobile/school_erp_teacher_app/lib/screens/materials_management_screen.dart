import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:provider/provider.dart';
import 'package:school_erp_mobile_core/school_erp_mobile_core.dart';
import 'dart:convert';
import 'package:intl/intl.dart';
import 'material_detail_screen.dart';

class MaterialsManagementScreen extends StatefulWidget {
  final String courseId;
  final String courseName;

  const MaterialsManagementScreen({
    super.key,
    required this.courseId,
    required this.courseName,
  });

  @override
  State<MaterialsManagementScreen> createState() => _MaterialsManagementScreenState();
}

class _MaterialsManagementScreenState extends State<MaterialsManagementScreen> {
  bool _isLoading = true;
  String? _error;
  List<Map<String, dynamic>> _materials = [];
  bool _isUploading = false;

  @override
  void initState() {
    super.initState();
    _loadMaterials();
  }

  Future<void> _loadMaterials() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final res = await ApiClient.get(context, '/courses/${widget.courseId}/materials');
      if (res.statusCode == 200) {
        if (mounted) setState(() {
          _materials = (json.decode(res.body) as List).cast<Map<String, dynamic>>();
          _isLoading = false;
        });
      } else {
        if (mounted) setState(() { _error = 'Failed to load materials.'; _isLoading = false; });
      }
    } catch (_) {
      if (mounted) setState(() { _error = 'Network connection failed.'; _isLoading = false; });
    }
  }

  Future<void> _uploadMaterial() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx'],
    );
    
    if (result == null || result.files.single.path == null) return;

    if (!mounted) return;
    
    final titleCtrl = TextEditingController();
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
        child: Container(
          decoration: const BoxDecoration(color: ClayTheme.background, borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Name Upload', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
              const SizedBox(height: 24),
              ClayInput(controller: titleCtrl, hintText: 'Material Title'),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ClayButton(
                  onPressed: () => Navigator.pop(ctx, true),
                  child: const Text('UPLOAD'),
                ),
              ),
            ],
          ),
        ),
      ),
    );

    if (titleCtrl.text.isEmpty) return;

    setState(() => _isUploading = true);
    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final staffId = auth.user?['staffId'] ?? '';
      final userId = auth.user?['id'] ?? '';

      final res = await ApiClient.multipartRequest(
        context,
        'POST',
        '/courses/${widget.courseId}/materials',
        fileField: 'file',
        filePath: result.files.single.path!,
        fileName: result.files.single.name,
        fields: {
          'title': titleCtrl.text.trim()
        },
        headers: {
          'X-User-ID': userId,
          'X-Staff-ID': staffId,
          'X-User-Role': 'TEACHER',
        },
      );

      if (res.statusCode == 200 && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Material published.'), backgroundColor: ClayTheme.success));
        _loadMaterials();
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Upload failed.'), backgroundColor: ClayTheme.danger));
      }
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Network error.'), backgroundColor: ClayTheme.danger));
    } finally {
      if (mounted) setState(() => _isUploading = false);
    }
  }

 

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Course Materials'), backgroundColor: Colors.transparent, elevation: 0),
      floatingActionButton: _isUploading
          ? const FloatingActionButton(onPressed: null, backgroundColor: Colors.grey, child: CircularProgressIndicator(color: Colors.white))
          : FloatingActionButton.extended(
              onPressed: _uploadMaterial,
              backgroundColor: ClayTheme.primary,
              icon: const Icon(Icons.cloud_upload, color: Colors.white),
              label: const Text('Add Material', style: TextStyle(color: Colors.white)),
            ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Text(widget.courseName, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: Builder(
              builder: (ctx) {
                if (_isLoading) return const Center(child: CircularProgressIndicator());
                if (_error != null) return ClayErrorState(message: _error!, onRetry: _loadMaterials);
                if (_materials.isEmpty) return const ClayEmptyState(title: 'No Materials', message: 'No documents uploaded yet.', icon: Icons.folder_open);

                return ListView.builder(
                  padding: const EdgeInsets.all(20),
                  itemCount: _materials.length,
                  itemBuilder: (ctx, idx) {
                    final m = _materials[idx];
                    DateTime? cAt;
                    try { cAt = DateTime.parse(m['createdAt']); } catch (_) {}
                    final dateStr = cAt != null ? DateFormat('MMM dd, yyyy').format(cAt) : 'Unknown';

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: ClayCard(
                        padding: const EdgeInsets.all(16),
                        onTap: () async {
                           final refreshed = await Navigator.push(context, MaterialPageRoute(builder: (_) => MaterialDetailScreen(
                             courseId: widget.courseId,
                             materialId: m['id'],
                             initialTitle: m['title'] ?? 'Document',
                           )));
                           if (refreshed == true && mounted) {
                             _loadMaterials();
                           }
                        },
                        child: Row(
                          children: [
                            const Icon(Icons.insert_drive_file, color: ClayTheme.primary, size: 36),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(m['title'] ?? 'Document', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: ClayTheme.textDark)),
                                  const SizedBox(height: 4),
                                  Text(m['fileName'] ?? '', style: const TextStyle(color: ClayTheme.textLight, fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis),
                                  const SizedBox(height: 4),
                                  Text(dateStr, style: const TextStyle(color: Colors.grey, fontSize: 10)),
                                ],
                              ),
                            ),
                            const Icon(Icons.arrow_forward_ios, color: ClayTheme.primary, size: 16),
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
