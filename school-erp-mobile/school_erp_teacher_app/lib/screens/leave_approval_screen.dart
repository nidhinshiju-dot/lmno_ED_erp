import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:school_erp_mobile_core/school_erp_mobile_core.dart';
import 'dart:convert';

class LeaveApprovalScreen extends StatefulWidget {
  const LeaveApprovalScreen({super.key});

  @override
  State<LeaveApprovalScreen> createState() => _LeaveApprovalScreenState();
}

class _LeaveApprovalScreenState extends State<LeaveApprovalScreen> {
  bool _isLoading = true;
  String? _error;
  List<Map<String, dynamic>> _leaves = [];
  String _currentFilter = 'PENDING';

  @override
  void initState() {
    super.initState();
    _loadRequests();
  }

  Future<void> _loadRequests() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final classId = auth.user?['classId'] ?? 'CLASS_XYZ';
      
      final res = await ApiClient.get(context, '/leaves/pending', headers: {'X-Class-ID': classId});
      if (res.statusCode == 200) {
        if (mounted) setState(() {
          _leaves = (json.decode(res.body) as List).cast<Map<String, dynamic>>();
          _isLoading = false;
        });
      } else {
        if (mounted) setState(() { _error = 'Failed to load leave requests.'; _isLoading = false; });
      }
    } catch (_) {
      if (mounted) setState(() { _error = 'Network connection failed.'; _isLoading = false; });
    }
  }

  Future<void> _updateStatus(String leaveId, String newStatus) async {
    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final classId = auth.user?['classId'] ?? 'CLASS_XYZ';
      final staffId = auth.user?['staffId'] ?? 'TEACHER_1';
      final endpoint = newStatus == 'APPROVED' ? 'approve' : 'reject';
      
      final res = await ApiClient.patch(context, '/leaves/$leaveId/$endpoint', {}, headers: {'X-Class-ID': classId, 'X-Staff-ID': staffId});
      if (res.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Leave $newStatus'), backgroundColor: newStatus == 'APPROVED' ? ClayTheme.success : ClayTheme.danger));
        _loadRequests();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to update status'), backgroundColor: ClayTheme.danger));
      }
    } catch (_) {
       ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Network error'), backgroundColor: ClayTheme.danger));
    }
  }

  void _openDecisionModal(Map<String, dynamic> leave) {
    if (leave['status'] != 'PENDING') return;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: ClayTheme.background,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Review Leave Request', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
            const SizedBox(height: 16),
            Text('Student ID: ${leave['studentId']}', style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('Dates: ${leave['startDate']} to ${leave['endDate']}'),
            const SizedBox(height: 8),
            Text('Reason: ${leave['reason']}'),
            const SizedBox(height: 32),
            Row(
              children: [
                Expanded(
                  child: ClayButton(
                    color: ClayTheme.danger,
                    onPressed: () { Navigator.pop(ctx); _updateStatus(leave['id'], 'REJECTED'); },
                    child: const Text('REJECT', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ClayButton(
                    color: ClayTheme.success,
                    onPressed: () { Navigator.pop(ctx); _updateStatus(leave['id'], 'APPROVED'); },
                    child: const Text('APPROVE', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Pending Leaves'), backgroundColor: Colors.transparent, elevation: 0),
      body: Column(
        children: [
          const SizedBox(height: 16),
          Expanded(
            child: Builder(
              builder: (ctx) {
                if (_isLoading) return const Center(child: CircularProgressIndicator());
                if (_error != null) return ClayErrorState(message: _error!, onRetry: _loadRequests);
                if (_leaves.isEmpty) return ClayEmptyState(title: 'No Requests', message: 'No $_currentFilter leave requests right now.', icon: Icons.playlist_add_check);

                return ListView.builder(
                  padding: const EdgeInsets.all(20),
                  itemCount: _leaves.length,
                  itemBuilder: (ctx, idx) {
                    final l = _leaves[idx];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: ClayCard(
                        padding: const EdgeInsets.all(16),
                        onTap: () => _openDecisionModal(l),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(l['studentId']?.toString() ?? 'Student', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                ClayStatusChip(
                                  label: l['status'], 
                                  color: l['status'] == 'APPROVED' ? ClayTheme.success : (l['status'] == 'REJECTED' ? ClayTheme.danger : ClayTheme.warning)
                                )
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text('${l['startDate']} to ${l['endDate']}', style: const TextStyle(fontWeight: FontWeight.w600)),
                            const SizedBox(height: 4),
                            Text(l['reason'] ?? 'No reason provided.', style: const TextStyle(color: ClayTheme.textLight)),
                          ],
                        ),
                      ),
                    );
                  },
                );
              }
            )
          ),
        ],
      )
    );
  }
}
