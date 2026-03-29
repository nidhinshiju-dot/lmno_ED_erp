import 'package:flutter/material.dart';
import '../core/api_client.dart';
import '../widgets/clay_container.dart';
import 'dart:convert';

class AiTutorPreferencesScreen extends StatefulWidget {
  final String tutorId;

  const AiTutorPreferencesScreen({Key? key, required this.tutorId}) : super(key: key);

  @override
  _AiTutorPreferencesScreenState createState() => _AiTutorPreferencesScreenState();
}

class _AiTutorPreferencesScreenState extends State<AiTutorPreferencesScreen> {
  Map<String, dynamic> _prefs = {
    'explanationStyle': 'BALANCED',
    'answerLength': 'MODERATE',
    'preferExamples': true,
    'preferFormulas': true,
    'preferTheory': true,
    'goalType': 'GENERAL_MASTERY'
  };
  bool _isLoading = true;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _fetchPrefs();
  }

  Future<void> _fetchPrefs() async {
    try {
      final response = await ApiClient.get(context, '/ai-tutors/${widget.tutorId}/preferences');
      if (response.statusCode == 200) {
        setState(() {
          _prefs = json.decode(response.body);
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _savePrefs() async {
    setState(() => _isSaving = true);
    try {
      await ApiClient.put(context, '/ai-tutors/${widget.tutorId}/preferences', _prefs);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Preferences updated successfully')));
    } finally {
      setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F0F3),
      appBar: AppBar(
        title: const Text('Tutor Preferences'),
        backgroundColor: Colors.transparent, 
        elevation: 0, 
        foregroundColor: Colors.black,
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : ListView(
            padding: const EdgeInsets.all(16),
            children: [
              ClayContainer(
                color: const Color(0xFFF0F0F3),
                child: Column(
                  children: [
                    _buildDropdown('Explanation Style', 'explanationStyle', ['BRIEF', 'BALANCED', 'DETAILED', 'SOCRATIC']),
                    const SizedBox(height: 16),
                    _buildDropdown('Answer Length', 'answerLength', ['SHORT', 'MODERATE', 'LONG']),
                    const SizedBox(height: 16),
                    _buildDropdown('Goal Focus', 'goalType', ['GENERAL_MASTERY', 'EXAM_PREP', 'QUICK_HELP']),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              ClayContainer(
                color: const Color(0xFFF0F0F3),
                child: Column(
                  children: [
                    _buildSwitch('Provide Examples', 'preferExamples'),
                    _buildSwitch('Include Formulas', 'preferFormulas'),
                    _buildSwitch('Explain Theory', 'preferTheory'),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: Colors.blue.shade600,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))
                ),
                onPressed: _isSaving ? null : _savePrefs,
                child: _isSaving ? const CircularProgressIndicator(color: Colors.white) : const Text('Save Matrix'),
              )
            ],
          ),
    );
  }

  Widget _buildDropdown(String label, String key, List<String> options) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(color: Colors.white.withOpacity(0.5), borderRadius: BorderRadius.circular(8)),
          child: DropdownButton<String>(
            value: _prefs[key],
            isExpanded: true,
            underline: const SizedBox(),
            items: options.map((o) => DropdownMenuItem(value: o, child: Text(o))).toList(),
            onChanged: (val) {
              setState(() => _prefs[key] = val);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildSwitch(String title, String key) {
    return SwitchListTile(
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
      value: _prefs[key] ?? false,
      activeColor: Colors.blue,
      onChanged: (val) {
        setState(() => _prefs[key] = val);
      },
    );
  }
}
