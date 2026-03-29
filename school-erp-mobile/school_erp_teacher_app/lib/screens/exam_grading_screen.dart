import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:school_erp_mobile_core/school_erp_mobile_core.dart';
import 'package:provider/provider.dart';

class ExamGradingScreen extends StatefulWidget {
  final String examId;
  final String examTitle;

  const ExamGradingScreen({
    super.key,
    required this.examId,
    required this.examTitle,
  });

  @override
  State<ExamGradingScreen> createState() => _ExamGradingScreenState();
}

class _ExamGradingScreenState extends State<ExamGradingScreen> {
  bool _isLoading = true;
  bool _isSaving = false;
  List<Map<String, dynamic>> _roster = [];
  final Map<String, TextEditingController> _controllers = {};

  @override
  void initState() {
    super.initState();
    _loadExamRoster();
  }

  Future<void> _loadExamRoster() async {
    try {
      final res = await ApiClient.get(context, '/exams/${widget.examId}/results');
      if (res.statusCode == 200) {
        final List<dynamic> data = json.decode(res.body);
        if (mounted) {
          setState(() {
            _roster = data.cast<Map<String, dynamic>>();
            for (var r in _roster) {
              final studentId = r['studentId'] as String;
              _controllers[studentId] = TextEditingController(
                text: r['marksObtained']?.toString() ?? '',
              );
            }
            _isLoading = false;
          });
        }
      } else {
        _generateMockRoster();
      }
    } catch (_) {
      _generateMockRoster();
    }
  }

  void _generateMockRoster() {
    if (mounted) {
      setState(() {
        _roster = [
          {'studentId': 'S101', 'studentName': 'Alice Johnson', 'marksObtained': null, 'id': 'R1'},
          {'studentId': 'S102', 'studentName': 'Bob Smith', 'marksObtained': 85, 'id': 'R2'},
          {'studentId': 'S103', 'studentName': 'Charlie Davis', 'marksObtained': null, 'id': 'R3'},
        ];
        for (var r in _roster) {
          _controllers[r['studentId']] = TextEditingController(text: r['marksObtained']?.toString() ?? '');
        }
        _isLoading = false;
      });
    }
  }

  Future<void> _saveGrades() async {
    setState(() => _isSaving = true);
    
    List<Map<String, dynamic>> payload = [];
    for (var r in _roster) {
      final studentId = r['studentId'];
      final text = _controllers[studentId]?.text.trim();
      if (text != null && text.isNotEmpty) {
        payload.add({
          'id': r['id'],
          'examId': widget.examId,
          'studentId': studentId,
          'marksObtained': int.tryParse(text) ?? 0,
        });
      }
    }

    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final staffId = auth.user?['staffId'] ?? 'mock_staff_1';
      final res = await ApiClient.post(
        context, 
        '/exams/${widget.examId}/results', 
        payload,
        headers: {'X-User-Role': 'TEACHER', 'X-Staff-ID': staffId},
      );
      
      if (mounted) {
        if (res.statusCode == 200) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Grades saved successfully!'), backgroundColor: ClayTheme.success));
          Navigator.pop(context);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to save grades'), backgroundColor: ClayTheme.danger));
        }
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Network error saving grades'), backgroundColor: ClayTheme.danger));
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  void dispose() {
    for (var c in _controllers.values) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Grading: ${widget.examTitle}'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: _isLoading
        ? const Center(child: CircularProgressIndicator())
        : Column(
            children: [
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.all(20),
                  itemCount: _roster.length,
                  itemBuilder: (context, index) {
                    final r = _roster[index];
                    final sId = r['studentId'];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12.0),
                      child: ClayContainer(
                        depth: true,
                        emboss: false,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        child: Row(
                          children: [
                            CircleAvatar(
                              backgroundColor: ClayTheme.primary.withOpacity(0.1),
                              child: Text(sId.toString().substring(sId.length - 2), style: const TextStyle(color: ClayTheme.primary)),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Text(r['studentName'] ?? 'Unknown', style: const TextStyle(fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
                            ),
                            SizedBox(
                              width: 80,
                              child: ClayInput(
                                controller: _controllers[sId],
                                hintText: 'Score',
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              ClayContainer(
                depth: true,
                emboss: false,
                color: Colors.white,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                padding: const EdgeInsets.all(24),
                child: SafeArea(
                  child: Row(
                    children: [
                      Expanded(
                        child: ClayButton(
                          onPressed: _isSaving ? null : _saveGrades,
                          isLoading: _isSaving,
                          child: const Text('SUBMIT GRADES'),
                        ),
                      ),
                    ],
                  ),
                ),
              )
            ],
          ),
    );
  }
}
