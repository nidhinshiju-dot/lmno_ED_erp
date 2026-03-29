import 'dart:convert';
import 'package:flutter/material.dart';
import '../core/api_client.dart';
import '../widgets/clay_container.dart';

class AiTutorListScreen extends StatefulWidget {
  const AiTutorListScreen({Key? key}) : super(key: key);

  @override
  _AiTutorListScreenState createState() => _AiTutorListScreenState();
}

class _AiTutorListScreenState extends State<AiTutorListScreen> {
  List<dynamic> _tutors = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchTutors();
  }

  Future<void> _fetchTutors() async {
    try {
      final response = await ApiClient.get(context, '/ai-tutors');
      if (response.statusCode == 200) {
        setState(() {
          _tutors = json.decode(response.body);
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
      appBar: AppBar(title: const Text('My AI Tutors'), backgroundColor: Colors.transparent, elevation: 0, foregroundColor: Colors.black),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: _tutors.length,
            itemBuilder: (context, index) {
              final tutor = _tutors[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 16.0),
                child: ClayContainer(
                  color: const Color(0xFFF0F0F3),
                  child: ListTile(
                    leading: const CircleAvatar(child: Icon(Icons.smart_toy)),
                    title: Text(tutor['name'] ?? 'AI Tutor', style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('Status: ${tutor['status']}'),
                    trailing: const Icon(Icons.chat_bubble_outline),
                    onTap: () {
                      // Navigate to chat
                    },
                  ),
                ),
              );
            },
          ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Open create tutor dialog
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
