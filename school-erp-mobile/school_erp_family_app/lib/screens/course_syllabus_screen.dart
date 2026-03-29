import 'dart:convert';
import 'package:flutter/material.dart';
import '../core/api_client.dart';
import '../widgets/clay_container.dart';

class CourseSyllabusScreen extends StatefulWidget {
  final String courseId;

  const CourseSyllabusScreen({Key? key, required this.courseId}) : super(key: key);

  @override
  _CourseSyllabusScreenState createState() => _CourseSyllabusScreenState();
}

class _CourseSyllabusScreenState extends State<CourseSyllabusScreen> {
  Map<String, dynamic>? _syllabus;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchSyllabus();
  }

  Future<void> _fetchSyllabus() async {
    try {
      final response = await ApiClient.get(context, '/courses/${widget.courseId}/syllabus');
      if (response.statusCode == 200) {
        setState(() {
          _syllabus = json.decode(response.body);
          _isLoading = false;
        });
      } else {
        setState(() {
          _isLoading = false;
        });
      }
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F0F3), // Neumorphic background
      appBar: AppBar(title: const Text('Course Syllabus'), backgroundColor: Colors.transparent, elevation: 0, foregroundColor: Colors.black),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : _syllabus == null 
          ? const Center(child: Text('No syllabus available.'))
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: ClayContainer(
                color: const Color(0xFFF0F0F3),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(_syllabus!['title'] ?? 'Syllabus', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 10),
                    Text(_syllabus!['description'] ?? 'No description provided.'),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        const Icon(Icons.picture_as_pdf, color: Colors.red),
                        const SizedBox(width: 8),
                        Expanded(child: Text(_syllabus!['fileName'] ?? 'document.pdf')),
                        IconButton(
                          icon: const Icon(Icons.download),
                          onPressed: () {
                            // Implement download logic via /courses/{courseId}/syllabus/{id}/download
                          },
                        )
                      ],
                    )
                  ],
                ),
              ),
            ),
    );
  }
}
