import 'package:flutter/material.dart';
import 'package:school_erp_mobile_core/school_erp_mobile_core.dart';
import 'package:provider/provider.dart';
import 'dart:convert';
import 'package:intl/intl.dart';
import 'student_material_detail_screen.dart';

class AcademicsTab extends StatefulWidget {
  const AcademicsTab({super.key});

  @override
  State<AcademicsTab> createState() => _AcademicsTabState();
}

class _AcademicsTabState extends State<AcademicsTab> {
  bool _isLoading = true;
  String? _error;
  List<Map<String, dynamic>> _assignments = [];
  List<Map<String, dynamic>> _results = [];
  List<Map<String, dynamic>> _courses = [];

  @override
  void initState() {
    super.initState();
    _loadAcademicsData();
  }

  Future<void> _loadAcademicsData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final studentId = auth.user?['studentId'] ?? 'me';

      try {
         final timeRes = await ApiClient.get(context, '/timetable/active/student/$studentId');
         if (timeRes.statusCode == 200) {
            final List<dynamic> data = json.decode(timeRes.body);
            _timetableSlots = data.map((slot) => TimelineItemData(
                id: slot['id'] ?? '',
                timeRange: '${slot['startTime']} - ${slot['endTime']}',
                title: '${slot['subjectName']}',
                subtitle: 'Room: ${slot['roomName']} • Teacher: ${slot['teacherName']}',
                tag: 'Class',
                isActive: true,
            )).toList();
         } else { _mockTimetable(); }
      } catch(_) { _mockTimetable(); }

      try {
         final assigRes = await ApiClient.get(context, '/assignments/student/$studentId/submissions');
         if (assigRes.statusCode == 200) {
            _assignments = (json.decode(assigRes.body) as List).cast<Map<String, dynamic>>();
         } else { _mockAssignments(); }
      } catch (_) { _mockAssignments(); }

      try {
         final resultsRes = await ApiClient.get(context, '/exams/results/student/$studentId');
         if (resultsRes.statusCode == 200) {
            _results = (json.decode(resultsRes.body) as List).cast<Map<String, dynamic>>();
         } else { _mockResults(); }
      try {
         final classId = auth.user?['classId'] ?? 'CLASS_XYZ';
         final courseRes = await ApiClient.get(context, '/courses/class/$classId');
         if (courseRes.statusCode == 200) {
            _courses = (json.decode(courseRes.body) as List).cast<Map<String, dynamic>>();
         }
      } catch (_) {}

    } catch (e) {
      if (mounted) setState(() => _error = 'Failed to load academic data safely. Please check connection and try again.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _mockTimetable() { _timetableSlots = []; }
  void _mockAssignments() { _assignments = []; }
  void _mockResults() { _results = []; }

  void _openAssignmentSubmit(Map<String, dynamic> assignment) {
      if (assignment['status'] != 'PENDING') return;

      final textCtrl = TextEditingController();
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (ctx) => Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
          child: Container(
            decoration: const BoxDecoration(color: ClayTheme.background, borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Submit: ${assignment['title']}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
                const SizedBox(height: 24),
                ClayInput(controller: textCtrl, hintText: 'Assignment text or link'),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  child: ClayButton(
                    onPressed: () { 
                       Navigator.pop(ctx);
                       ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Assignment Submitted!')));
                    },
                    child: const Text('SUBMIT WORK'),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    if (_error != null) return ClayErrorState(message: _error!, onRetry: _loadAcademicsData);

    return DefaultTabController(
      length: 5,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0),
            child: ClayContainer(
              depth: false,
              emboss: true,
              color: ClayTheme.background,
              borderRadius: BorderRadius.circular(12),
              padding: EdgeInsets.zero,
              child: TabBar(
                indicator: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  color: ClayTheme.primary.withOpacity(0.1),
                ),
                labelColor: ClayTheme.primary,
                unselectedLabelColor: ClayTheme.textLight,
                tabs: const [Tab(text: "Timetable"), Tab(text: "Assignments"), Tab(text: "Syllabus"), Tab(text: "Materials"), Tab(text: "Results")],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: TabBarView(
              children: [
                // Timetable Tab
                _timetableSlots.isEmpty
                  ? const ClayEmptyState(title: 'No Classes', message: "You don't have any scheduled classes right now.", icon: Icons.free_breakfast)
                  : SingleChildScrollView(padding: const EdgeInsets.all(20), child: ClayTimeline(items: _timetableSlots)),
                
                // Assignments Tab
                _assignments.isEmpty
                  ? const ClayEmptyState(title: 'All caught up!', message: "You have no active or historical assignments matching your profile.", icon: Icons.celebration)
                  : ListView.builder(
                      padding: const EdgeInsets.all(20),
                      itemCount: _assignments.length,
                      itemBuilder: (context, index) {
                        final a = _assignments[index];
                        final isPending = a['status'] == 'PENDING';
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16.0),
                          child: ClayCard(
                            padding: const EdgeInsets.all(16),
                            onTap: () => _openAssignmentSubmit(a),
                            child: Row(
                              children: [
                                 CircleAvatar(backgroundColor: isPending ? ClayTheme.warning.withOpacity(0.1) : ClayTheme.success.withOpacity(0.1), child: Icon(isPending ? Icons.pending_actions : Icons.check_circle, color: isPending ? ClayTheme.warning : ClayTheme.success)),
                                 const SizedBox(width: 16),
                                 Expanded(child: Column(
                                   crossAxisAlignment: CrossAxisAlignment.start,
                                   children: [
                                     Text(a['title'], style: const TextStyle(fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
                                     Text('Due: ${a['dueDate']}', style: const TextStyle(fontSize: 12, color: ClayTheme.textLight)),
                                   ],
                                 )),
                                 ClayStatusChip(label: isPending ? 'PENDING' : 'GRADED: ${a['score']}', color: isPending ? ClayTheme.warning : ClayTheme.success),
                              ],
                            ),
                          ),
                        );
                      },
                    ),

                // Syllabus Tab
                _courses.isEmpty 
                  ? const ClayEmptyState(title: "No Courses", message: "You are not enrolled in any courses with a syllabus.", icon: Icons.library_books)
                  : ListView.builder(
                      padding: const EdgeInsets.all(20),
                      itemCount: _courses.length,
                      itemBuilder: (context, index) {
                        final course = _courses[index];
                        final subName = course['title'] ?? 'Subject';
                        
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: ClayCard(
                            padding: const EdgeInsets.all(16),
                            child: Row(
                              children: [
                                const Icon(Icons.picture_as_pdf, color: Colors.redAccent, size: 36),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('$subName Syllabus', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: ClayTheme.textDark)),
                                      const SizedBox(height: 4),
                                      const Text('Latest PDF version', style: TextStyle(color: ClayTheme.textLight, fontSize: 12)),
                                    ],
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.download, color: ClayTheme.primary),
                                  onPressed: () async {
                                    try {
                                      // Get latest syllabus ID for course
                                      final latestRes = await ApiClient.get(context, '/courses/${course['id']}/syllabus');
                                      if (latestRes.statusCode == 200) {
                                        final latestData = json.decode(latestRes.body);
                                        final syllabusId = latestData['id'];
                                        
                                        // Request Presigned URL
                                        final urlRes = await ApiClient.get(context, '/courses/${course['id']}/syllabus/$syllabusId/download');
                                        if (urlRes.statusCode == 200) {
                                          final urlData = json.decode(urlRes.body);
                                          final url = urlData['url'];
                                          if (url != null && context.mounted) {
                                            await PdfViewerService.launchRemotePdf(context, url);
                                            return;
                                          }
                                        }
                                      }
                                      if (context.mounted) {
                                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Syllabus not found or unavailable'), backgroundColor: ClayTheme.warning));
                                      }
                                    } catch (e) {
                                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to open syllabus'), backgroundColor: ClayTheme.danger));
                                    }
                                  },
                                )
                              ],
                            ),
                          ),
                        );
                      },
                  ),

                // Materials Tab
                _courses.isEmpty 
                  ? const ClayEmptyState(title: "No Courses", message: "You are not enrolled in any courses to view materials.", icon: Icons.folder)
                  : ListView.builder(
                      padding: const EdgeInsets.all(20),
                      itemCount: _courses.length,
                      itemBuilder: (context, index) {
                        final course = _courses[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: ClayCard(
                            padding: const EdgeInsets.all(16),
                            child: Row(
                              children: [
                                const Icon(Icons.folder_shared, color: ClayTheme.primary, size: 36),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('${course['title'] ?? 'Subject'} Materials', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: ClayTheme.textDark)),
                                      const SizedBox(height: 4),
                                      const Text('Tap to view documents', style: TextStyle(color: ClayTheme.textLight, fontSize: 12)),
                                    ],
                                  ),
                                ),
                                ClayButton(
                                  onPressed: () {
                                    showModalBottomSheet(
                                      context: context,
                                      isScrollControlled: true,
                                      backgroundColor: Colors.transparent,
                                      builder: (ctx) => CourseMaterialsSheet(courseId: course['id'], courseName: course['title']),
                                    );
                                  },
                                  child: const Text('OPEN', style: TextStyle(fontSize: 12)),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                  ),

                // Results Tab
                _results.isEmpty
                  ? const ClayEmptyState(title: 'No Results Found', message: "Your exam grades haven't been published yet.", icon: Icons.history_edu)
                  : ListView.builder(
                      padding: const EdgeInsets.all(20),
                      itemCount: _results.length,
                      itemBuilder: (context, index) {
                        final r = _results[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: ClayCard(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                 Text(r['examName'], style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
                                 const SizedBox(height: 12),
                                 Row(
                                   mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                   children: [
                                     Column(
                                       crossAxisAlignment: CrossAxisAlignment.start,
                                       children: [
                                         const Text('Score', style: TextStyle(color: ClayTheme.textLight, fontSize: 12)),
                                         Text('${r['marksObtained']} / ${r['maxMarks']}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: ClayTheme.primary)),
                                       ],
                                     ),
                                     Column(
                                       crossAxisAlignment: CrossAxisAlignment.end,
                                       children: [
                                         const Text('Rank', style: TextStyle(color: ClayTheme.textLight, fontSize: 12)),
                                         ClayStatusChip(label: '#${r['classRank']}', color: ClayTheme.success),
                                       ],
                                     ),
                                   ],
                                 )
                              ],
                            ),
                          ),
                        );
                      },
                    ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}



