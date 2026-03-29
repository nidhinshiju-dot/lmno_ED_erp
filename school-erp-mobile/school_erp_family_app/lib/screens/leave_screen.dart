import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:school_erp_mobile_core/school_erp_mobile_core.dart';
import 'dart:convert';
import 'package:intl/intl.dart';

class LeaveScreen extends StatefulWidget {
  const LeaveScreen({super.key});

  @override
  State<LeaveScreen> createState() => _LeaveScreenState();
}

class _LeaveScreenState extends State<LeaveScreen> {
  bool _isLoading = true;
  String? _error;
  List<Map<String, dynamic>> _leaves = [];

  final _reasonCtrl = TextEditingController();
  DateTime? _startDate;
  DateTime? _endDate;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final studentId = auth.user?['studentId'] ?? 'me';
      
      final res = await ApiClient.get(context, '/leaves/my', headers: {'X-Student-ID': studentId});
      if (res.statusCode == 200) {
        if (mounted) setState(() {
          _leaves = (json.decode(res.body) as List).cast<Map<String, dynamic>>();
          _isLoading = false;
        });
      } else {
        if (mounted) setState(() { _error = 'Failed to load leave history.'; _isLoading = false; });
      }
    } catch (_) {
      if (mounted) setState(() { _error = 'Network connection failed.'; _isLoading = false; });
    }
  }

  Future<void> _submitLeave() async {
    if (_startDate == null || _endDate == null || _reasonCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please complete all fields.'), backgroundColor: ClayTheme.warning));
      return;
    }
    
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final payload = {
      'studentId': auth.user?['studentId'] ?? 'me',
      'classId': auth.user?['classId'] ?? 'CLASS_XYZ',
      'startDate': DateFormat('yyyy-MM-dd').format(_startDate!),
      'endDate': DateFormat('yyyy-MM-dd').format(_endDate!),
      'reason': _reasonCtrl.text.trim(),
      'submittedBy': auth.user?['id'] ?? 'user_self',
      'status': 'PENDING',
    };

    try {
      final res = await ApiClient.post(context, '/leaves', payload);
      if (res.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Leave request submitted.'), backgroundColor: ClayTheme.success));
        _startDate = null; _endDate = null; _reasonCtrl.clear();
        _loadHistory();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to submit request.'), backgroundColor: ClayTheme.danger));
      }
    } catch (_) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Network error.'), backgroundColor: ClayTheme.danger));
    }
  }

  Future<void> _pickDate(bool isStart) async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: now,
      firstDate: now.subtract(const Duration(days: 30)),
      lastDate: now.add(const Duration(days: 365)),
    );
    if (picked != null) {
      setState(() {
        if (isStart) {
          _startDate = picked;
          if (_endDate != null && picked.isAfter(_endDate!)) _endDate = null;
        } else {
          _endDate = picked;
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Leave Management'), backgroundColor: Colors.transparent, elevation: 0),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : ListView(
            padding: const EdgeInsets.all(20),
            children: [
              const Text('Apply for Leave', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
              const SizedBox(height: 16),
              
              ClayContainer(
                depth: true,
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Expanded(child: ClayButton(
                          onPressed: () => _pickDate(true),
                          color: ClayTheme.background,
                          textColor: ClayTheme.textDark,
                          child: Text(_startDate != null ? DateFormat('MMM dd').format(_startDate!) : 'Start Date'),
                        )),
                        const SizedBox(width: 16),
                        Expanded(child: ClayButton(
                          onPressed: () => _pickDate(false),
                          color: ClayTheme.background,
                          textColor: ClayTheme.textDark,
                          child: Text(_endDate != null ? DateFormat('MMM dd').format(_endDate!) : 'End Date'),
                        )),
                      ],
                    ),
                    const SizedBox(height: 16),
                    ClayContainer(
                      depth: false, emboss: true, color: ClayTheme.background,
                      child: TextField(controller: _reasonCtrl, decoration: const InputDecoration(hintText: 'Reason for leave', border: InputBorder.none, contentPadding: EdgeInsets.all(16)), maxLines: 3),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(width: double.infinity, child: ClayButton(onPressed: _submitLeave, child: const Text('SUBMIT REQUEST'))),
                  ],
                ),
              ),

              const SizedBox(height: 32),
              const Text('Leave History', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
              const SizedBox(height: 16),

              if (_error != null) ClayErrorState(message: _error!, onRetry: _loadHistory),
              if (_error == null && _leaves.isEmpty) const ClayEmptyState(title: 'No Leaves', message: 'You have no leave history.', icon: Icons.history),

              ..._leaves.map((l) {
                Color statusColor = ClayTheme.warning;
                if (l['status'] == 'APPROVED') statusColor = ClayTheme.success;
                if (l['status'] == 'REJECTED') statusColor = ClayTheme.danger;

                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: ClayCard(
                    padding: const EdgeInsets.all(16),
                    onTap: () {
                      showModalBottomSheet(
                        context: context,
                        backgroundColor: Colors.transparent,
                        builder: (ctx) => Container(
                          padding: const EdgeInsets.all(24),
                          decoration: const BoxDecoration(color: ClayTheme.background, borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Leave Details', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
                              const SizedBox(height: 16),
                              Text('Dates: ${l['startDate']} to ${l['endDate']}'),
                              const SizedBox(height: 8),
                              Text('Reason: ${l['reason']}'),
                              const SizedBox(height: 16),
                              ClayStatusChip(label: l['status'], color: statusColor),
                              const SizedBox(height: 32),
                              if (l['status'] == 'PENDING')
                                SizedBox(
                                  width: double.infinity,
                                  child: ClayButton(
                                    color: ClayTheme.warning,
                                    onPressed: () async {
                                      Navigator.pop(ctx);
                                      try {
                                        final auth = Provider.of<AuthProvider>(context, listen: false);
                                        final sid = auth.user?['studentId'] ?? 'me';
                                        final cancelRes = await ApiClient.patch(context, '/leaves/${l['id']}/cancel', {}, headers: {'X-Student-ID': sid});
                                        if (cancelRes.statusCode == 200 && mounted) {
                                          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Leave cancelled')));
                                          _loadHistory();
                                        }
                                      } catch (_) {}
                                    },
                                    child: const Text('CANCEL LEAVE', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      );
                    },
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('${l['startDate']} to ${l['endDate']}', style: const TextStyle(fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
                              const SizedBox(height: 4),
                              Text(l['reason'] ?? '', maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: ClayTheme.textLight)),
                            ],
                          ),
                        ),
                        ClayStatusChip(label: l['status'], color: statusColor),
                      ],
                    ),
                  ),
                );
              }),
            ],
          ),
    );
  }
}
