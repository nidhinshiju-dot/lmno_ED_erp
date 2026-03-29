import 'dart:convert';
import 'package:flutter/material.dart';
import '../core/api_client.dart';

class TimetableTab extends StatefulWidget {
  const TimetableTab({super.key});

  @override
  State<TimetableTab> createState() => _TimetableTabState();
}

class _TimetableTabState extends State<TimetableTab> {
  List<Map<String, dynamic>> _entries = [];
  bool _isLoading = true;
  String? _error;

  static const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  static const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  @override
  void initState() {
    super.initState();
    _loadTimetable();
  }

  Future<void> _loadTimetable() async {
    try {
      final response = await ApiClient.get(context, '/timetable');
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          _entries = data.cast<Map<String, dynamic>>();
          _isLoading = false;
        });
      } else {
        setState(() { _error = 'Failed to load timetable'; _isLoading = false; });
      }
    } catch (_) {
      if (mounted) setState(() { _error = 'Network error'; _isLoading = false; });
    }
  }

  Map<String, dynamic>? _getCell(String day, int period) {
    try {
      return _entries.firstWhere((e) => e['day'] == day && e['period'] == period);
    } catch (_) {
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    if (_error != null) {
      return Center(
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          const Icon(Icons.error_outline, size: 48, color: Colors.red),
          const SizedBox(height: 16),
          Text(_error!),
          const SizedBox(height: 16),
          ElevatedButton(onPressed: () { setState(() { _isLoading = true; _error = null; }); _loadTimetable(); }, child: const Text('Retry')),
        ]),
      );
    }

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(12),
        child: DataTable(
          headingRowColor: WidgetStateColor.resolveWith((_) => Theme.of(context).colorScheme.primaryContainer.withValues(alpha: 0.3)),
          columnSpacing: 8,
          columns: [
            const DataColumn(label: Text('Period', style: TextStyle(fontWeight: FontWeight.bold))),
            ...days.map((d) => DataColumn(label: Text(d, style: const TextStyle(fontWeight: FontWeight.bold)))),
          ],
          rows: periods.map((p) {
            return DataRow(cells: [
              DataCell(Text('$p', style: const TextStyle(fontWeight: FontWeight.bold))),
              ...days.map((d) {
                final cell = _getCell(d, p);
                return DataCell(
                  cell != null
                      ? Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Theme.of(context).colorScheme.primaryContainer.withValues(alpha: 0.3),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(cell['subject'] ?? '—', style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onPrimaryContainer)),
                        )
                      : const Text('—', style: TextStyle(color: Colors.grey)),
                );
              }),
            ]);
          }).toList(),
        ),
      ),
    );
  }
}
