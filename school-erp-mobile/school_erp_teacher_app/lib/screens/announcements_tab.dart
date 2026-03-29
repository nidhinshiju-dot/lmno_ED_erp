import 'dart:convert';
import 'package:flutter/material.dart';
import '../core/api_client.dart';

class AnnouncementsTab extends StatefulWidget {
  const AnnouncementsTab({super.key});

  @override
  State<AnnouncementsTab> createState() => _AnnouncementsTabState();
}

class _AnnouncementsTabState extends State<AnnouncementsTab> {
  List<Map<String, dynamic>> _announcements = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadAnnouncements();
  }

  Future<void> _loadAnnouncements() async {
    try {
      if (!mounted) return;
      final res = await ApiClient.get(context, '/announcements');
      if (res.statusCode == 200) {
        _announcements = (json.decode(res.body) as List).cast<Map<String, dynamic>>();
      }
    } catch (_) {}
    if (mounted) setState(() => _isLoading = false);
  }

  Color _priorityColor(String? priority) {
    switch (priority) {
      case 'HIGH': return Colors.red;
      case 'NORMAL': return Colors.blue;
      case 'LOW': return Colors.grey;
      default: return Colors.blue;
    }
  }

  IconData _priorityIcon(String? priority) {
    switch (priority) {
      case 'HIGH': return Icons.priority_high;
      case 'NORMAL': return Icons.info_outline;
      case 'LOW': return Icons.arrow_downward;
      default: return Icons.info_outline;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (_isLoading) return const Center(child: CircularProgressIndicator());

    return RefreshIndicator(
      onRefresh: _loadAnnouncements,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text('Announcements', style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text('Stay updated with school news.', style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey)),
          const SizedBox(height: 20),

          if (_announcements.isEmpty)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(children: [
                  Icon(Icons.campaign_outlined, size: 48, color: Colors.grey.shade300),
                  const SizedBox(height: 12),
                  const Text('No announcements yet.', style: TextStyle(color: Colors.grey)),
                ]),
              ),
            )
          else
            ..._announcements.map((ann) => Card(
              margin: const EdgeInsets.only(bottom: 10),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(_priorityIcon(ann['priority']), size: 18, color: _priorityColor(ann['priority'])),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: _priorityColor(ann['priority']).withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(ann['priority'] ?? 'NORMAL', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: _priorityColor(ann['priority']))),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.indigo.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(ann['scope'] ?? 'SCHOOL', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.indigo)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(ann['title'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    if (ann['content'] != null && ann['content'].toString().isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Text(ann['content'], style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
                    ],
                    if (ann['createdAt'] != null) ...[
                      const SizedBox(height: 8),
                      Text(ann['createdAt'].toString().substring(0, 16).replaceAll('T', ' '), style: TextStyle(fontSize: 11, color: Colors.grey.shade400)),
                    ],
                  ],
                ),
              ),
            )),
        ],
      ),
    );
  }
}
