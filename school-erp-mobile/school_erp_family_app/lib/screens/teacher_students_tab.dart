import 'dart:convert';
import 'package:flutter/material.dart';
import '../core/api_client.dart';

class TeacherStudentsTab extends StatefulWidget {
  const TeacherStudentsTab({super.key});

  @override
  State<TeacherStudentsTab> createState() => _TeacherStudentsTabState();
}

class _TeacherStudentsTabState extends State<TeacherStudentsTab> {
  List<Map<String, dynamic>> _students = [];
  bool _isLoading = true;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadStudents();
  }

  Future<void> _loadStudents() async {
    try {
      if (!mounted) return;
      final response = await ApiClient.get(context, '/students');
      if (response.statusCode == 200) {
        _students = (json.decode(response.body) as List).cast<Map<String, dynamic>>();
      }
    } catch (_) {}
    if (mounted) setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final filtered = _students.where((s) {
      final name = (s['name'] ?? '').toString().toLowerCase();
      final admNo = (s['admissionNumber'] ?? '').toString().toLowerCase();
      return name.contains(_searchQuery.toLowerCase()) || admNo.contains(_searchQuery.toLowerCase());
    }).toList();

    if (_isLoading) return const Center(child: CircularProgressIndicator());

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: TextField(
            decoration: InputDecoration(
              hintText: 'Search students...',
              prefixIcon: const Icon(Icons.search),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              filled: true,
            ),
            onChanged: (v) => setState(() => _searchQuery = v),
          ),
        ),
        Expanded(
          child: filtered.isEmpty
              ? const Center(child: Text('No students found', style: TextStyle(color: Colors.grey)))
              : RefreshIndicator(
                  onRefresh: _loadStudents,
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: filtered.length,
                    itemBuilder: (ctx, i) {
                      final s = filtered[i];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: theme.colorScheme.primaryContainer,
                            child: Text((s['name'] ?? 'X').toString()[0].toUpperCase(), style: TextStyle(color: theme.colorScheme.onPrimaryContainer, fontWeight: FontWeight.bold)),
                          ),
                          title: Text(s['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text('ID: ${s['admissionNumber'] ?? '-'}'),
                          trailing: Text(s['parentContact'] ?? '', style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                        ),
                      );
                    },
                  ),
                ),
        ),
      ],
    );
  }
}
