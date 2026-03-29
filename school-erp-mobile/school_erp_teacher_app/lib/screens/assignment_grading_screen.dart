import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:school_erp_mobile_core/school_erp_mobile_core.dart';
import 'package:provider/provider.dart';

class AssignmentGradingScreen extends StatefulWidget {
  final String assignmentId;
  final String assignmentTitle;

  const AssignmentGradingScreen({
    super.key,
    required this.assignmentId,
    required this.assignmentTitle,
  });

  @override
  State<AssignmentGradingScreen> createState() => _AssignmentGradingScreenState();
}

class _AssignmentGradingScreenState extends State<AssignmentGradingScreen> {
  bool _isLoading = true;
  List<Map<String, dynamic>> _submissions = [];

  @override
  void initState() {
    super.initState();
    _loadSubmissions();
  }

  Future<void> _loadSubmissions() async {
    try {
      final res = await ApiClient.get(context, '/assignments/${widget.assignmentId}/submissions');
      if (res.statusCode == 200) {
        final List<dynamic> data = json.decode(res.body);
        if (mounted) {
          setState(() {
            _submissions = data.cast<Map<String, dynamic>>();
            _isLoading = false;
          });
        }
      } else {
        _generateMockSubmissions();
      }
    } catch (_) {
      _generateMockSubmissions();
    }
  }

  void _generateMockSubmissions() {
    if (mounted) {
      setState(() {
        _submissions = [
          {'id': 'sub_1', 'studentId': 'S101', 'status': 'SUBMITTED', 'score': null, 'feedback': null, 'submittedAt': '2023-11-01T10:00:00'},
          {'id': 'sub_2', 'studentId': 'S102', 'status': 'GRADED', 'score': 95, 'feedback': 'Excellent work!', 'submittedAt': '2023-11-01T11:30:00'},
        ];
        _isLoading = false;
      });
    }
  }

  void _openGradingModal(Map<String, dynamic> sub) {
    if (sub['status'] == 'GRADED') {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Already graded.')));
      return;
    }

    final scoreCtrl = TextEditingController();
    final feedbackCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
        child: Container(
          decoration: const BoxDecoration(
            color: ClayTheme.background,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Grade Submission: ${sub['studentId']}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
              const SizedBox(height: 24),
              ClayInput(controller: scoreCtrl, hintText: 'Score (out of 100)'),
              const SizedBox(height: 16),
              ClayInput(controller: feedbackCtrl, hintText: 'Feedback / Comments'),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ClayButton(
                  onPressed: () async {
                    final score = int.tryParse(scoreCtrl.text.trim()) ?? 0;
                    final feedback = feedbackCtrl.text.trim();
                    try {
                      final res = await ApiClient.patch(context, '/assignments/submissions/${sub['id']}/grade', {
                        'score': score,
                        'feedback': feedback,
                      });
                      if (context.mounted) {
                        Navigator.pop(ctx);
                        if (res.statusCode == 200) {
                          _loadSubmissions();
                        } else {
                          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to grade'), backgroundColor: ClayTheme.danger));
                        }
                      }
                    } catch (_) {
                       if (context.mounted) {
                          Navigator.pop(ctx);
                          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Network error'), backgroundColor: ClayTheme.danger));
                       }
                    }
                  },
                  child: const Text('SUBMIT GRADE'),
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
    return Scaffold(
      appBar: AppBar(
        title: Text('Submissions: ${widget.assignmentTitle}'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: _submissions.length,
              itemBuilder: (context, index) {
                final sub = _submissions[index];
                final isGraded = sub['status'] == 'GRADED';

                return Padding(
                  padding: const EdgeInsets.only(bottom: 16.0),
                  child: ClayCard(
                    padding: const EdgeInsets.all(16),
                    onTap: () => _openGradingModal(sub),
                    child: Row(
                      children: [
                        CircleAvatar(
                          backgroundColor: isGraded ? ClayTheme.success.withOpacity(0.1) : ClayTheme.warning.withOpacity(0.1),
                          child: Icon(isGraded ? Icons.check_circle : Icons.pending_actions, color: isGraded ? ClayTheme.success : ClayTheme.warning),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Student: ${sub['studentId']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: ClayTheme.textDark)),
                              const SizedBox(height: 4),
                              Text(isGraded ? 'Score: ${sub['score']}' : 'Needs Grading', style: TextStyle(color: ClayTheme.textLight, fontSize: 14)),
                            ],
                          ),
                        ),
                        Icon(Icons.chevron_right, color: ClayTheme.textLight),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
