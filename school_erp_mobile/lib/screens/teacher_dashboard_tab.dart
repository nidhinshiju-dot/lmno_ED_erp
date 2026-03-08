import 'dart:convert';
import 'package:flutter/material.dart';
import '../core/api_client.dart';

class TeacherDashboardTab extends StatefulWidget {
  const TeacherDashboardTab({super.key});

  @override
  State<TeacherDashboardTab> createState() => _TeacherDashboardTabState();
}

class _TeacherDashboardTabState extends State<TeacherDashboardTab> {
  final List<Map<String, dynamic>> _sections = [];
  List<Map<String, dynamic>> _courses = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      if (!mounted) return;
      final courseRes = await ApiClient.get(context, '/courses');
      if (courseRes.statusCode == 200) {
        _courses = (json.decode(courseRes.body) as List).cast<Map<String, dynamic>>();
      }
    } catch (_) {}
    if (mounted) setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (_isLoading) return const Center(child: CircularProgressIndicator());

    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.indigo.shade400, Colors.indigo.shade700],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Teacher Dashboard 📚', style: theme.textTheme.headlineSmall?.copyWith(color: Colors.white, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text('Manage your classes and assignments.', style: theme.textTheme.bodyMedium?.copyWith(color: Colors.white70)),
              ],
            ),
          ),
          const SizedBox(height: 24),

          Row(
            children: [
              Expanded(child: _StatCard(icon: Icons.class_outlined, label: 'Sections', value: '${_sections.length}', color: Colors.indigo)),
              const SizedBox(width: 12),
              Expanded(child: _StatCard(icon: Icons.book, label: 'Courses', value: '${_courses.length}', color: Colors.teal)),
              const SizedBox(width: 12),
              Expanded(child: _StatCard(icon: Icons.assignment, label: 'Pending', value: '—', color: Colors.orange)),
            ],
          ),
          const SizedBox(height: 24),

          Text('My Courses', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          if (_courses.isEmpty)
            Card(child: ListTile(leading: const Icon(Icons.info_outline), title: const Text('No courses assigned yet.')))
          else
            ..._courses.map((c) => Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: theme.colorScheme.primaryContainer,
                  child: Text((c['code'] ?? 'XX').toString().substring(0, 2).toUpperCase(), style: TextStyle(color: theme.colorScheme.onPrimaryContainer, fontWeight: FontWeight.bold)),
                ),
                title: Text(c['title'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text(c['description'] ?? ''),
                trailing: const Icon(Icons.chevron_right),
              ),
            )),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({required this.icon, required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 12),
        child: Column(children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
          const SizedBox(height: 4),
          Text(label, style: Theme.of(context).textTheme.bodySmall),
        ]),
      ),
    );
  }
}
