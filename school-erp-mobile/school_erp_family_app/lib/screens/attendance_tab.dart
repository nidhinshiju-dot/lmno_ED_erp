import 'dart:convert';
import 'package:flutter/material.dart';
import '../core/api_client.dart';

class AttendanceTab extends StatefulWidget {
  const AttendanceTab({super.key});

  @override
  State<AttendanceTab> createState() => _AttendanceTabState();
}

class _AttendanceTabState extends State<AttendanceTab> {
  List<Map<String, dynamic>> _records = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadAttendance();
  }

  Future<void> _loadAttendance() async {
    try {
      if (!mounted) return;
      // For student: GET /attendance/student/{studentId}
      // Demo: show mock or empty
      final res = await ApiClient.get(context, '/attendance/student/demo');
      if (res.statusCode == 200) {
        _records = (json.decode(res.body) as List).cast<Map<String, dynamic>>();
      }
    } catch (_) {}
    if (mounted) setState(() => _isLoading = false);
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'PRESENT': return Colors.green;
      case 'ABSENT': return Colors.red;
      case 'LATE': return Colors.orange;
      default: return Colors.grey;
    }
  }

  IconData _statusIcon(String status) {
    switch (status) {
      case 'PRESENT': return Icons.check_circle;
      case 'ABSENT': return Icons.cancel;
      case 'LATE': return Icons.access_time;
      default: return Icons.help_outline;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());

    final present = _records.where((r) => r['status'] == 'PRESENT').length;
    final absent = _records.where((r) => r['status'] == 'ABSENT').length;
    final total = _records.length;
    final percentage = total > 0 ? (present / total * 100).toStringAsFixed(1) : '—';

    return RefreshIndicator(
      onRefresh: _loadAttendance,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Summary Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.blue.shade400, Colors.blue.shade700],
                begin: Alignment.topLeft, end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Attendance Summary', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _SummaryItem(label: 'Present', value: '$present', color: Colors.white),
                    _SummaryItem(label: 'Absent', value: '$absent', color: Colors.white),
                    _SummaryItem(label: 'Rate', value: '$percentage%', color: Colors.white),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          Text('Recent Attendance', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),

          if (_records.isEmpty)
            const Card(child: ListTile(leading: Icon(Icons.info_outline), title: Text('No attendance records yet.')))
          else
            ..._records.map((r) => Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: Icon(_statusIcon(r['status'] ?? ''), color: _statusColor(r['status'] ?? '')),
                title: Text(r['date'] ?? 'Unknown date', style: const TextStyle(fontWeight: FontWeight.bold)),
                trailing: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: _statusColor(r['status'] ?? '').withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(r['status'] ?? '', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: _statusColor(r['status'] ?? ''))),
                ),
              ),
            )),
        ],
      ),
    );
  }
}

class _SummaryItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  const _SummaryItem({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
      Text(label, style: TextStyle(fontSize: 12, color: color.withValues(alpha: 0.8))),
    ]);
  }
}
