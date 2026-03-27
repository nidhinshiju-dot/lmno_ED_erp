import 'package:flutter/material.dart';
import 'package:school_erp_mobile_core/school_erp_mobile_core.dart';
import 'package:school_erp_family_app/screens/student_material_detail_screen.dart';
import 'dart:convert';

class CourseMaterialsSheet extends StatefulWidget {
  final String courseId;
  final String? courseName;

  const CourseMaterialsSheet({super.key, required this.courseId, this.courseName});

  @override
  State<CourseMaterialsSheet> createState() => _CourseMaterialsSheetState();
}

class _CourseMaterialsSheetState extends State<CourseMaterialsSheet> {
  bool _isLoading = true;
  List<Map<String, dynamic>> _materials = [];

  @override
  void initState() {
    super.initState();
    _loadMaterials();
  }

  Future<void> _loadMaterials() async {
    try {
      final res = await ApiClient.get(context, '/courses/${widget.courseId}/materials');
      if (res.statusCode == 200) {
        if (mounted) setState(() {
          _materials = (json.decode(res.body) as List).cast<Map<String, dynamic>>();
          _isLoading = false;
        });
      } else {
        if (mounted) setState(() => _isLoading = false);
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(color: ClayTheme.background, borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      padding: const EdgeInsets.all(24),
      height: MediaQuery.of(context).size.height * 0.7,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('${widget.courseName ?? 'Course'} Materials', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
          const SizedBox(height: 16),
          Expanded(
            child: _isLoading 
              ? const Center(child: CircularProgressIndicator())
              : _materials.isEmpty 
                  ? const ClayEmptyState(title: "Empty", message: "Teacher hasn't uploaded any materials.", icon: Icons.folder_open)
                  : ListView.builder(
                      itemCount: _materials.length,
                      itemBuilder: (ctx, idx) {
                        final m = _materials[idx];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: ClayCard(
                            depth: true,
                            padding: const EdgeInsets.all(16),
                            onTap: () {
                               Navigator.pop(context); // Close sheet
                               Navigator.push(context, MaterialPageRoute(builder: (_) => StudentMaterialDetailScreen(
                                 courseId: widget.courseId,
                                 materialId: m['id'],
                                 initialTitle: m['title'] ?? 'Document',
                               )));
                            },
                            child: Row(
                              children: [
                                const Icon(Icons.insert_drive_file, color: ClayTheme.primary),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(m['title'] ?? 'Document', style: const TextStyle(fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
                                      Text(m['fileName'] ?? '', style: const TextStyle(fontSize: 12, color: ClayTheme.textLight), maxLines: 1, overflow: TextOverflow.ellipsis),
                                    ],
                                  ),
                                ),
                                const Icon(Icons.arrow_forward_ios, color: ClayTheme.primary, size: 16)
                              ],
                            ),
                          ),
                        );
                      },
                    ),
          ),
        ],
      ),
    );
  }
}
