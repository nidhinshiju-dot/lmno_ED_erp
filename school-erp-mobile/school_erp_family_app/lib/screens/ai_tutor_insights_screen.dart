import 'package:flutter/material.dart';
import '../core/api_client.dart';
import '../widgets/clay_container.dart';
import 'dart:convert';

class AiTutorInsightsScreen extends StatefulWidget {
  final String tutorId;

  const AiTutorInsightsScreen({Key? key, required this.tutorId}) : super(key: key);

  @override
  _AiTutorInsightsScreenState createState() => _AiTutorInsightsScreenState();
}

class _AiTutorInsightsScreenState extends State<AiTutorInsightsScreen> {
  List<dynamic> _insights = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchInsights();
  }

  Future<void> _fetchInsights() async {
    try {
      final response = await ApiClient.get(context, '/ai-tutors/${widget.tutorId}/insights');
      if (response.statusCode == 200) {
        setState(() {
          _insights = json.decode(response.body);
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _refreshInsights() async {
    setState(() => _isLoading = true);
    try {
      final response = await ApiClient.post(context, '/ai-tutors/${widget.tutorId}/refresh-insights', {});
      if (response.statusCode == 200) {
        setState(() {
          _insights = json.decode(response.body);
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  IconData _getIconForType(String type) {
    if (type == "WEAK_TOPIC") return Icons.warning_amber_rounded;
    if (type == "STRONG_TOPIC") return Icons.star_border;
    if (type == "ATTENDANCE_HINT") return Icons.calendar_today;
    if (type == "REVISION_PRIORITY") return Icons.priority_high;
    return Icons.lightbulb_outline;
  }

  Color _getColorForType(String type) {
    if (type == "WEAK_TOPIC") return Colors.red.shade400;
    if (type == "STRONG_TOPIC") return Colors.green.shade400;
    if (type == "ATTENDANCE_HINT") return Colors.orange.shade400;
    if (type == "REVISION_PRIORITY") return Colors.purple.shade400;
    return Colors.blue.shade400;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F0F3),
      appBar: AppBar(
        title: const Text('Tutor Insights'),
        backgroundColor: Colors.transparent, 
        elevation: 0, 
        foregroundColor: Colors.black,
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _refreshInsights)
        ],
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : _insights.isEmpty 
          ? const Center(child: Text("No insights available. Tap refresh."))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _insights.length,
              itemBuilder: (context, index) {
                final insight = _insights[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16.0),
                  child: ClayContainer(
                    color: const Color(0xFFF0F0F3),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: _getColorForType(insight['insightType']).withOpacity(0.2),
                        child: Icon(_getIconForType(insight['insightType']), color: _getColorForType(insight['insightType'])),
                      ),
                      title: Text(insight['topicLabel'] ?? 'Unknown', style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text("Score: ${insight['score']} (${(insight['confidence'] * 100).toStringAsFixed(0)}% conf)\nType: ${insight['insightType']}"),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
