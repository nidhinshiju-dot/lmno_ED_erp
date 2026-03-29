import 'dart:convert';
import 'package:flutter/material.dart';
import '../core/api_client.dart';
import '../widgets/clay_container.dart';

class AiTutorChatScreen extends StatefulWidget {
  final String tutorId;

  const AiTutorChatScreen({Key? key, required this.tutorId}) : super(key: key);

  @override
  _AiTutorChatScreenState createState() => _AiTutorChatScreenState();
}

class _AiTutorChatScreenState extends State<AiTutorChatScreen> {
  final TextEditingController _controller = TextEditingController();
  final List<Map<String, String>> _messages = [];
  bool _isSending = false;
  String? _sessionId;

  @override
  void initState() {
    super.initState();
    _startSession();
  }

  Future<void> _startSession() async {
    final response = await ApiClient.post(context, '/ai-tutors/${widget.tutorId}/sessions', {});
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      _sessionId = data['id'];
    }
  }

  Future<void> _sendMessage() async {
    if (_controller.text.isEmpty || _sessionId == null) return;
    
    final text = _controller.text;
    setState(() {
      _messages.add({"role": "USER", "content": text});
      _isSending = true;
      _controller.clear();
    });

    try {
      final response = await ApiClient.post(context, '/ai-tutors/${widget.tutorId}/chat', {
        "sessionId": _sessionId,
        "content": text
      });

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _messages.add({"role": "AI", "content": data['content']});
        });
      }
    } finally {
      setState(() => _isSending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F0F3),
      appBar: AppBar(title: const Text('Tutor Chat'), backgroundColor: Colors.transparent, elevation: 0, foregroundColor: Colors.black),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isUser = msg["role"] == "USER";
                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: ClayContainer(
                      color: isUser ? Colors.blue.shade100 : const Color(0xFFF0F0F3),
                      borderRadius: BorderRadius.circular(12),
                      child: Text(msg["content"] ?? ""),
                    ),
                  ),
                );
              },
            ),
          ),
          if (_isSending) const Padding(padding: EdgeInsets.all(8.0), child: CircularProgressIndicator()),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: ClayContainer(
                    color: const Color(0xFFF0F0F3),
                    borderRadius: BorderRadius.circular(24),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: TextField(
                      controller: _controller,
                      decoration: const InputDecoration(border: InputBorder.none, hintText: "Ask something..."),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: _sendMessage,
                  child: ClayContainer(
                    color: Colors.blue.shade100,
                    borderRadius: BorderRadius.circular(24),
                    padding: const EdgeInsets.all(12),
                    child: const Icon(Icons.send, color: Colors.blue),
                  ),
                )
              ],
            ),
          )
        ],
      ),
    );
  }
}
