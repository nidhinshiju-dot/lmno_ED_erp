import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:provider/provider.dart';
import 'package:school_erp_mobile_core/school_erp_mobile_core.dart';
import 'dart:convert';
import 'package:intl/intl.dart';

class MaterialDetailScreen extends StatefulWidget {
  final String courseId;
  final String materialId;
  final String initialTitle;

  const MaterialDetailScreen({
    super.key,
    required this.courseId,
    required this.materialId,
    required this.initialTitle,
  });

  @override
  State<MaterialDetailScreen> createState() => _MaterialDetailScreenState();
}

class _MaterialDetailScreenState extends State<MaterialDetailScreen> {
  bool _isLoading = true;
  String? _error;
  Map<String, dynamic>? _material;
  bool _isProcessing = false;

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
        if (mounted) setState(() { _error = 'Failed to load material.'; _isLoading = false; });
      }
    } catch (_) {
      if (mounted) setState(() { _error = 'Network connection failed.'; _isLoading = false; });
    }
  }

  Future<void> _updateMaterial() async {
    final titleCtrl = TextEditingController(text: _material?['title'] ?? '');
    final descCtrl = TextEditingController(text: _material?['description'] ?? '');
    PlatformFile? selectedFile;
    bool replaceFile = false;
    
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
          child: Container(
            decoration: const BoxDecoration(color: ClayTheme.background, borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Update Material', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
                const SizedBox(height: 24),
                ClayInput(controller: titleCtrl, hintText: 'Material Title'),
                const SizedBox(height: 16),
                ClayInput(controller: descCtrl, hintText: 'Description (Optional)'),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: Text(selectedFile?.name ?? 'Keep current file', style: const TextStyle(color: ClayTheme.textLight)),
                    ),
                    TextButton(
                      child: const Text('REPLACE PDF'),
                      onPressed: () async {
                        final result = await FilePicker.platform.pickFiles(type: FileType.custom, allowedExtensions: ['pdf', 'doc', 'docx']);
                        if (result != null && result.files.isNotEmpty) {
                          setModalState(() {
                            selectedFile = result.files.single;
                            replaceFile = true;
                          });
                        }
                      },
                    )
                  ],
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  child: ClayButton(
                    onPressed: () => Navigator.pop(ctx, true),
                    child: const Text('UPDATE'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );

    if (!mounted) return;
    
    // Update logic
    setState(() => _isProcessing = true);
    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final staffId = auth.user?['staffId'] ?? '';
      
      final fields = <String, String>{};
      if (titleCtrl.text.isNotEmpty) fields['title'] = titleCtrl.text.trim();
      if (descCtrl.text.isNotEmpty) fields['description'] = descCtrl.text.trim();

      if (replaceFile && selectedFile?.path != null) {
        final res = await ApiClient.multipartRequest(
          context,
          'PUT',
          '/courses/${widget.courseId}/materials/${widget.materialId}',
          fileField: 'file',
          filePath: selectedFile!.path!,
          fileName: selectedFile!.name,
          fields: fields,
          headers: {'X-Staff-ID': staffId, 'X-User-Role': 'TEACHER'},
        );
        if (res.statusCode == 200 && mounted) {
           ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Material updated.'), backgroundColor: ClayTheme.success));
           _loadMaterial();
        }
      } else {
        // Just update metadata. We don't have a specific PATCH for metadata yet, but our backend PUT allows null file!
        // We will just invoke a standard PUT via Multipart without a file. 
        // Our multipartRequest supports not attaching a file if filePath is empty. Wait, ApiClient multipartRequest requires a file currently. 
        // But our backend's @RequestParam("file") is NOT REQUIRED, so we can just fire a PUT request with query params?
        // Wait, the backend PUT has @RequestParam(value = "file", required = false) MultipartFile file. 
        // Let's send a Multipart without the file field.
        final uri = Uri.parse(ApiClient.baseUrl + '/courses/${widget.courseId}/materials/${widget.materialId}?title=${Uri.encodeComponent(titleCtrl.text.trim())}&description=${Uri.encodeComponent(descCtrl.text.trim())}');
        final req = await ApiClient.put(context, uri.path, headers: {'X-Staff-ID': staffId, 'X-User-Role': 'TEACHER'});
        if (req.statusCode == 200 && mounted) {
           ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Material metadata updated.'), backgroundColor: ClayTheme.success));
           _loadMaterial();
        }
      }
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Update failed.'), backgroundColor: ClayTheme.danger));
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  Future<void> _archiveMaterial() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Archive Material?'),
        content: const Text('This will hide the material from students.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Archive', style: TextStyle(color: ClayTheme.danger))),
        ],
      )
    );
    if (confirm != true) return;

    setState(() => _isProcessing = true);
    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final res = await ApiClient.patch(
        context, 
        '/courses/${widget.courseId}/materials/${widget.materialId}/archive',
        headers: {
          'X-Staff-ID': auth.user?['staffId'] ?? '',
          'X-User-Role': 'TEACHER',
        }
      );
      if (res.statusCode == 204 && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Material archived.'), backgroundColor: ClayTheme.success));
        Navigator.pop(context, true); // Go back with refresh flag
      }
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to archive.'), backgroundColor: ClayTheme.danger));
    } finally {
      if (mounted) setState(() => _isProcessing = false);
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
      }
    } catch (_) {}
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
        actions: [
          if (!_isProcessing)
            IconButton(
              icon: const Icon(Icons.edit, color: ClayTheme.primary),
              onPressed: _updateMaterial,
            ),
        ],
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
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
                          const Icon(Icons.picture_as_pdf, color: Colors.redAccent, size: 48),
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
                    child: const Text('OPEN DOCUMENT', style: TextStyle(fontSize: 16)),
                  ),
                ),
                const SizedBox(height: 16),
                Center(
                  child: TextButton.icon(
                    icon: const Icon(Icons.archive, color: ClayTheme.danger),
                    label: const Text('Archive Material', style: TextStyle(color: ClayTheme.danger)),
                    onPressed: _archiveMaterial,
                  ),
                )
              ],
            ),
          ),
          if (_isProcessing)
            Container(
              color: Colors.black.withOpacity(0.3),
              child: const Center(child: CircularProgressIndicator(color: ClayTheme.primary)),
            )
        ],
      ),
    );
  }
}
