import 'dart:convert';
import 'package:flutter/material.dart';
import '../core/api_client.dart';
import '../widgets/clay_container.dart';

class AiTutorStudyPlanScreen extends StatefulWidget {
  final String tutorId;

  const AiTutorStudyPlanScreen({Key? key, required this.tutorId}) : super(key: key);

  @override
  _AiTutorStudyPlanScreenState createState() => _AiTutorStudyPlanScreenState();
}

class _AiTutorStudyPlanScreenState extends State<AiTutorStudyPlanScreen> {
  Map<String, dynamic>? _plan;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchOrGeneratePlan();
  }

  Future<void> _fetchOrGeneratePlan() async {
    try {
      final response = await ApiClient.post(context, '/ai-tutors/${widget.tutorId}/study-plan', {"title": "My Plan"});
      if (response.statusCode == 200) {
        setState(() {
          _plan = json.decode(response.body);
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
      appBar: AppBar(title: const Text('Study Plan'), backgroundColor: Colors.transparent, elevation: 0, foregroundColor: Colors.black),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : _plan == null 
          ? const Center(child: Text('Failed to load plan.'))
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: ClayContainer(
                color: const Color(0xFFF0F0F3),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(_plan!['title'] ?? 'Plan', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    Expanded(
                      child: SingleChildScrollView(
                        child: Text(_plan!['content'] ?? ''),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
