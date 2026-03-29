import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:provider/provider.dart';
import 'package:school_erp_mobile_core/school_erp_mobile_core.dart';

class SyllabusUploadScreen extends StatefulWidget {
  final String courseId;
  final String courseName;

  const SyllabusUploadScreen({
    super.key,
    required this.courseId,
    required this.courseName,
  });

  @override
  State<SyllabusUploadScreen> createState() => _SyllabusUploadScreenState();
}

class _SyllabusUploadScreenState extends State<SyllabusUploadScreen> {
  String? _selectedFilePath;
  String? _selectedFileName;
  bool _isUploading = false;

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'doc', 'docx'],
    );
    
    if (result != null && result.files.single.path != null) {
      if (mounted) setState(() {
        _selectedFilePath = result.files.single.path;
        _selectedFileName = result.files.single.name;
      });
    }
  }

  Future<void> _uploadSyllabus() async {
    if (_selectedFilePath == null || _selectedFileName == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please attach a document first.')));
      return;
    }

    setState(() => _isUploading = true);
    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final staffId = auth.user?['staffId'] ?? 'TEACHER_1';
      final userId = auth.user?['id'] ?? 'USER_1';

      final res = await ApiClient.multipartRequest(
        context,
        'POST',
        '/courses/${widget.courseId}/syllabus',
        fileField: 'file',
        filePath: _selectedFilePath!,
        fileName: _selectedFileName!,
        headers: {
          'X-User-ID': userId,
          'X-Staff-ID': staffId,
          'X-User-Role': 'TEACHER',
        },
      );

      if (res.statusCode == 200) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Syllabus uploaded successfully!'), backgroundColor: ClayTheme.success));
          Navigator.pop(context); // Go back to course list
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Upload failed.'), backgroundColor: ClayTheme.danger));
        }
      }
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Network error. Check connection.'), backgroundColor: ClayTheme.danger));
    } finally {
      if (mounted) setState(() => _isUploading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Upload Syllabus'), backgroundColor: Colors.transparent, elevation: 0),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.courseName, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
            const SizedBox(height: 8),
            const Text('Upload the official lesson plan or syllabus document for this assigned class. Formats: PDF, DOCX', style: TextStyle(color: ClayTheme.textLight, height: 1.5)),
            const SizedBox(height: 48),

            GestureDetector(
              onTap: _pickFile,
              child: ClayContainer(
                depth: _selectedFileName == null ? true : false,
                emboss: _selectedFileName != null,
                padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
                borderRadius: BorderRadius.circular(20),
                color: _selectedFileName != null ? ClayTheme.success.withOpacity(0.1) : ClayTheme.background,
                child: Center(
                  child: Column(
                    children: [
                      Icon(
                        _selectedFileName != null ? Icons.check_circle : Icons.upload_file,
                        size: 64,
                        color: _selectedFileName != null ? ClayTheme.success : ClayTheme.primary,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _selectedFileName ?? 'Tap to select document',
                        style: TextStyle(fontWeight: FontWeight.bold, color: _selectedFileName != null ? ClayTheme.success : ClayTheme.textDark),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(height: 48),
            
            SizedBox(
              width: double.infinity,
              child: ClayButton(
                onPressed: _isUploading ? null : _uploadSyllabus,
                child: _isUploading 
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('PUBLISH SYLLABUS'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
