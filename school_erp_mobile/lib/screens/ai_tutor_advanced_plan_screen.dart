import 'package:flutter/material.dart';
import '../core/api_client.dart';
import '../widgets/clay_container.dart';
import 'dart:convert';

class AiTutorAdvancedPlanScreen extends StatefulWidget {
  final String tutorId;

  const AiTutorAdvancedPlanScreen({Key? key, required this.tutorId}) : super(key: key);

  @override
  _AiTutorAdvancedPlanScreenState createState() => _AiTutorAdvancedPlanScreenState();
}

class _AiTutorAdvancedPlanScreenState extends State<AiTutorAdvancedPlanScreen> {
  Map<String, dynamic>? _advancedPlan;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchAdvancedPlan();
  }

  Future<void> _fetchAdvancedPlan() async {
    try {
      // Memory generation and preference fetching wrapped transparently
      final response = await ApiClient.post(context, '/ai-tutors/${widget.tutorId}/advanced-study-plan', {});
      if (response.statusCode == 200) {
        setState(() {
          _advancedPlan = json.decode(response.body);
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
        title: const Text('Advanced Study Plan'),
        backgroundColor: Colors.transparent, 
        elevation: 0, 
        foregroundColor: Colors.black,
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : _advancedPlan == null || _advancedPlan!['tailoredSchedule'] == null
          ? const Center(child: Text("Could not generate advanced cognitive matrices."))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _advancedPlan!['tailoredSchedule'].length,
              itemBuilder: (context, index) {
                final item = _advancedPlan!['tailoredSchedule'][index];
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
                              Text(item['dayOffset'] ?? '', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.indigo.shade800)),
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
                          const SizedBox(height: 12),
                          Text(item['topic'] ?? '', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
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
