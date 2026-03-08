import 'dart:convert';
import 'package:flutter/material.dart';
import '../core/api_client.dart';

class AssignmentsTab extends StatefulWidget {
  const AssignmentsTab({super.key});

  @override
  State<AssignmentsTab> createState() => _AssignmentsTabState();
}

class _AssignmentsTabState extends State<AssignmentsTab> {
  List<Map<String, dynamic>> _assignments = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadAssignments();
  }

  Future<void> _loadAssignments() async {
    try {
      final response = await ApiClient.get(context, '/assignments');
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          _assignments = data.cast<Map<String, dynamic>>();
          _isLoading = false;
        });
      } else {
        setState(() { _error = 'Failed to load assignments'; _isLoading = false; });
      }
    } catch (_) {
      if (mounted) setState(() { _error = 'Network error'; _isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (_isLoading) return const Center(child: CircularProgressIndicator());
    if (_error != null) {
      return Center(
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          const Icon(Icons.error_outline, size: 48, color: Colors.red),
          const SizedBox(height: 16),
          Text(_error!),
          const SizedBox(height: 16),
          ElevatedButton(onPressed: () { setState(() { _isLoading = true; _error = null; }); _loadAssignments(); }, child: const Text('Retry')),
        ]),
      );
    }

    if (_assignments.isEmpty) {
      return Center(
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(Icons.assignment_outlined, size: 64, color: Colors.grey.shade400),
          const SizedBox(height: 16),
          const Text('No assignments yet', style: TextStyle(fontSize: 16, color: Colors.grey)),
        ]),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadAssignments,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _assignments.length,
        itemBuilder: (context, index) {
          final assignment = _assignments[index];
          final dueDate = assignment['dueDate'] ?? 'No due date';
          final isOverdue = assignment['dueDate'] != null &&
              DateTime.tryParse(assignment['dueDate'])?.isBefore(DateTime.now()) == true;

          return Card(
            elevation: 1,
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              contentPadding: const EdgeInsets.all(16),
              leading: CircleAvatar(
                backgroundColor: isOverdue ? Colors.red.shade50 : theme.colorScheme.primaryContainer,
                child: Icon(
                  isOverdue ? Icons.warning_amber : Icons.assignment,
                  color: isOverdue ? Colors.red : theme.colorScheme.onPrimaryContainer,
                ),
              ),
              title: Text(assignment['title'] ?? 'Untitled', style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 4),
                  Text(assignment['description'] ?? '', maxLines: 2, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.calendar_today, size: 14, color: isOverdue ? Colors.red : Colors.grey),
                      const SizedBox(width: 4),
                      Text(dueDate, style: TextStyle(fontSize: 12, color: isOverdue ? Colors.red : Colors.grey, fontWeight: FontWeight.w600)),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: isOverdue ? Colors.red.shade50 : Colors.green.shade50,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(isOverdue ? 'Overdue' : 'Pending', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isOverdue ? Colors.red : Colors.green)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
