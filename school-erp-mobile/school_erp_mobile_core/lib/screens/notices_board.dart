import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:convert';
import '../core/api_client.dart';
import '../providers/auth_provider.dart';
import '../widgets/clay_theme.dart';
import '../widgets/clay_container.dart';
import '../widgets/clay_button.dart';
import '../widgets/clay_empty_state.dart';
import '../widgets/clay_error_state.dart';

class NoticesBoard extends StatefulWidget {
  final bool isTeacher; // If true, enables POSTing capabilities

  const NoticesBoard({super.key, required this.isTeacher});

  @override
  State<NoticesBoard> createState() => _NoticesBoardState();
}

class _NoticesBoardState extends State<NoticesBoard> {
  bool _isLoading = true;
  String? _error;
  List<Map<String, dynamic>> _announcements = [];

  @override
  void initState() {
    super.initState();
    _loadAnnouncements();
  }

  Future<void> _loadAnnouncements() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final endpoint = widget.isTeacher ? '/announcements/teacher' : '/announcements/student';
      final headers = widget.isTeacher 
          ? {'X-Staff-ID': auth.user?['staffId'] ?? ''}
          : {'X-Class-ID': auth.user?['classId'] ?? ''};
          
      final res = await ApiClient.get(context, endpoint, headers: headers);
      if (res.statusCode == 200) {
        if (mounted) setState(() {
          _announcements = (json.decode(res.body) as List).cast<Map<String, dynamic>>();
          _isLoading = false;
        });
      } else {
        if (mounted) setState(() { _error = 'Failed to load announcements'; _isLoading = false; });
      }
    } catch (_) {
      if (mounted) setState(() { _error = 'Network connection lost'; _isLoading = false; });
    }
  }

  void _openCreateNoticeSheet() {
    final titleCtrl = TextEditingController();
    final contentCtrl = TextEditingController();
    
    showModalBottomSheet(
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
              const Text('Broadcast Notice', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
              const SizedBox(height: 24),
              ClayContainer(
                depth: false, emboss: true, borderRadius: BorderRadius.circular(12), color: ClayTheme.background,
                child: TextField(controller: titleCtrl, decoration: const InputDecoration(hintText: 'Notice Title', border: InputBorder.none, contentPadding: EdgeInsets.all(16))),
              ),
              const SizedBox(height: 16),
              ClayContainer(
                depth: false, emboss: true, borderRadius: BorderRadius.circular(12), color: ClayTheme.background,
                child: TextField(controller: contentCtrl, maxLines: 4, decoration: const InputDecoration(hintText: 'Message content...', border: InputBorder.none, contentPadding: EdgeInsets.all(16))),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ClayButton(
                  onPressed: () async {
                    if (titleCtrl.text.isEmpty || contentCtrl.text.isEmpty) return;
                    try {
                      final auth = Provider.of<AuthProvider>(context, listen: false);
                      final payload = {
                        'title': titleCtrl.text.trim(),
                        'content': contentCtrl.text.trim(),
                        'scope': 'CLASS',
                        'targetId': auth.user?['classId'] ?? '',
                        'createdBy': auth.user?['staffId'] ?? 'SYSTEM',
                      };
                      final res = await ApiClient.post(context, '/announcements', payload);
                      if (context.mounted) {
                        Navigator.pop(ctx);
                        if (res.statusCode == 200) {
                          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Notice Broadcasted!'), backgroundColor: ClayTheme.success));
                          _loadAnnouncements();
                        } else {
                          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to broadcast'), backgroundColor: ClayTheme.danger));
                        }
                      }
                    } catch (_) {
                       if (context.mounted) {
                          Navigator.pop(ctx);
                          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Network error'), backgroundColor: ClayTheme.danger));
                       }
                    }
                  },
                  child: const Text('BROADCAST'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_error != null) return Scaffold(body: ClayErrorState(message: _error!, onRetry: _loadAnnouncements));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notice Board'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      floatingActionButton: widget.isTeacher 
        ? FloatingActionButton(
            onPressed: _openCreateNoticeSheet,
            backgroundColor: ClayTheme.primary,
            child: const Icon(Icons.campaign, color: Colors.white),
          )
        : null,
      body: _announcements.isEmpty
        ? const ClayEmptyState(title: "All quiet", message: "No active announcements exist right now.", icon: Icons.campaign)
        : ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: _announcements.length,
            itemBuilder: (context, index) {
              final a = _announcements[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: ClayContainer(
                  depth: true,
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          ClayContainer(
                            color: ClayTheme.primary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                            padding: const EdgeInsets.all(12),
                            child: const Icon(Icons.notifications_active, color: ClayTheme.primary),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(a['title'] ?? 'Notice', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: ClayTheme.textDark)),
                                const SizedBox(height: 4),
                                Text(a['createdAt']?.substring(0, 10) ?? 'Just now', style: const TextStyle(color: ClayTheme.textLight, fontSize: 12)),
                              ],
                            ),
                          )
                        ],
                      ),
                      const SizedBox(height: 16),
                      Text(a['content'] ?? '', style: const TextStyle(color: ClayTheme.textDark, height: 1.5)),
                    ],
                  ),
                ),
              );
            },
          ),
    );
  }
}
