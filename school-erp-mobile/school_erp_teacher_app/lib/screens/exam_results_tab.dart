import 'dart:convert';
import 'package:flutter/material.dart';
import '../core/api_client.dart';

class ExamResultsTab extends StatefulWidget {
  const ExamResultsTab({super.key});

  @override
  State<ExamResultsTab> createState() => _ExamResultsTabState();
}

class _ExamResultsTabState extends State<ExamResultsTab> {
  List<Map<String, dynamic>> _results = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadResults();
  }

  Future<void> _loadResults() async {
    try {
      if (!mounted) return;
      final res = await ApiClient.get(context, '/exams/results/student/demo');
      if (res.statusCode == 200) {
        _results = (json.decode(res.body) as List).cast<Map<String, dynamic>>();
      }
    } catch (_) {}
    if (mounted) setState(() => _isLoading = false);
  }

  Color _gradeColor(String? grade) {
    if (grade == null) return Colors.grey;
    if (grade.startsWith('A')) return Colors.green;
    if (grade.startsWith('B')) return Colors.blue;
    if (grade.startsWith('C')) return Colors.orange;
    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());

    return RefreshIndicator(
      onRefresh: _loadResults,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text('Exam Results', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text('View your examination results and grades.', style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.grey)),
          const SizedBox(height: 20),

          if (_results.isEmpty)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(children: [
                  Icon(Icons.assignment_outlined, size: 48, color: Colors.grey.shade300),
                  const SizedBox(height: 12),
                  const Text('No exam results published yet.', style: TextStyle(color: Colors.grey)),
                ]),
              ),
            )
          else
            ..._results.map((r) => Card(
              margin: const EdgeInsets.only(bottom: 10),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: _gradeColor(r['grade']).withValues(alpha: 0.1),
                      child: Text(r['grade'] ?? '?', style: TextStyle(fontWeight: FontWeight.bold, color: _gradeColor(r['grade']))),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Exam #${r['examId']?.toString().substring(0, 8) ?? '—'}', style: const TextStyle(fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Text('Marks: ${r['marksObtained'] ?? 0}', style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
                        ],
                      ),
                    ),
                    if (r['remarks'] != null && r['remarks'].toString().isNotEmpty)
                      Tooltip(
                        message: r['remarks'],
                        child: Icon(Icons.info_outline, size: 20, color: Colors.grey.shade400),
                      ),
                  ],
                ),
              ),
            )),
        ],
      ),
    );
  }
}
