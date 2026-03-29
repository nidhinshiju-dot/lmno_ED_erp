import 'package:flutter/material.dart';
import '../core/api_client.dart';
import '../widgets/clay_container.dart';
import 'dart:convert';

class AiTutorExamPlanScreen extends StatefulWidget {
  final String tutorId;

  const AiTutorExamPlanScreen({Key? key, required this.tutorId}) : super(key: key);

  @override
  _AiTutorExamPlanScreenState createState() => _AiTutorExamPlanScreenState();
}

class _AiTutorExamPlanScreenState extends State<AiTutorExamPlanScreen> {
  Map<String, dynamic>? _examPlan;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchExamPlan();
  }

  Future<void> _fetchExamPlan() async {
    try {
      final response = await ApiClient.post(context, '/ai-tutors/${widget.tutorId}/exam-plan', {});
      if (response.statusCode == 200) {
        setState(() {
          _examPlan = json.decode(response.body);
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F0F3),
      appBar: AppBar(
        title: const Text('Exam Prep Plan'),
        backgroundColor: Colors.transparent, 
        elevation: 0, 
        foregroundColor: Colors.black,
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : _examPlan == null || _examPlan!['schedule'] == null
          ? const Center(child: Text("No exam plan available."))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _examPlan!['schedule'].length,
              itemBuilder: (context, index) {
                final item = _examPlan!['schedule'][index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16.0),
                  child: ClayContainer(
                    color: const Color(0xFFF0F0F3),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(item['dayOffset'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blue)),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: item['priority'] == 'High' ? Colors.red.shade100 : Colors.green.shade100,
                                  borderRadius: BorderRadius.circular(12)
                                ),
                                child: Text(item['priority'] ?? '', style: TextStyle(fontSize: 12, color: item['priority'] == 'High' ? Colors.red : Colors.green)),
                              )
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(item['topic'] ?? '', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Text(item['activity'] ?? '', style: TextStyle(color: Colors.grey.shade700)),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
