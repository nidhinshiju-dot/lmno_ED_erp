import 'package:flutter/material.dart';
import 'package:school_erp_mobile_core/school_erp_mobile_core.dart';
import 'dart:convert';

class ChildTab extends StatefulWidget {
  const ChildTab({super.key});

  @override
  State<ChildTab> createState() => _ChildTabState();
}

class _ChildTabState extends State<ChildTab> {
  bool _isLoading = true;
  List<TimelineItemData> _timetableSlots = [];
  List<Map<String, dynamic>> _courses = [];
  Map<String, dynamic>? _childProfile;

  @override
  void initState() {
    super.initState();
    _loadChildData();
  }

  Future<void> _loadChildData() async {
    try {
      // Mocking child profile fetch
      _childProfile = {
         'name': 'Alice Johnson',
         'class': '10-A',
         'roll': '101',
      };

      try {
         final timeRes = await ApiClient.get(context, '/timetable/active/student/S101');
         if (timeRes.statusCode == 200) {
            final List<dynamic> data = json.decode(timeRes.body);
            _timetableSlots = data.map((slot) {
              return TimelineItemData(
                id: slot['id'] ?? '',
                timeRange: '${slot['startTime']} - ${slot['endTime']}',
                title: '${slot['subjectName']}',
                subtitle: 'Room: ${slot['roomName']} • Teacher: ${slot['teacherName']}',
                tag: 'Class',
                isActive: true,
              );
            }).toList();
         }
      } catch(_) { _mockTimetable(); }

      try {
         final auth = Provider.of<AuthProvider>(context, listen: false);
         final classId = auth.user?['classId'] ?? 'CLASS_XYZ';
         final res = await ApiClient.get(context, '/courses/class/$classId');
         if (res.statusCode == 200) {
            _courses = (json.decode(res.body) as List).cast<Map<String, dynamic>>();
         }
      } catch (_) {}

    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _mockTimetable() {
      _timetableSlots = [
          TimelineItemData(id: '1', timeRange: '08:00 AM - 08:45 AM', title: 'Mathematics', subtitle: 'Room 101 • Mr. Smith', tag: 'Period 1', isActive: false),
          TimelineItemData(id: '2', timeRange: '08:50 AM - 09:35 AM', title: 'Physics', subtitle: 'Lab 2 • Mrs. Davis', tag: 'Period 2', isActive: true),
          TimelineItemData(id: '3', timeRange: '09:40 AM - 10:25 AM', title: 'Chemistry', subtitle: 'Lab 1 • Mr. Rogers', tag: 'Period 3', isActive: false),
      ];
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());

    return RefreshIndicator(
      onRefresh: _loadChildData,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          ClayContainer(
             color: ClayTheme.primary,
             borderRadius: BorderRadius.circular(20),
             padding: const EdgeInsets.all(24),
             depth: true,
             child: Row(
               children: [
                 ClayContainer(
                   padding: const EdgeInsets.all(4),
                   color: Colors.white,
                   borderRadius: BorderRadius.circular(40),
                   child: const CircleAvatar(radius: 36, backgroundColor: Colors.white, child: Icon(Icons.person, size: 40, color: ClayTheme.primary)),
                 ),
                 const SizedBox(width: 20),
                 Expanded(
                   child: Column(
                     crossAxisAlignment: CrossAxisAlignment.start,
                     children: [
                        Text(_childProfile?['name'] ?? 'Child Name', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
                        const SizedBox(height: 4),
                        Text('Grade: ${_childProfile?['class'] ?? '-'}', style: const TextStyle(color: Colors.white70)),
                        Text('Roll No: ${_childProfile?['roll'] ?? '-'}', style: const TextStyle(color: Colors.white70)),
                     ],
                   ),
                 )
               ],
             )
          ),

          const SizedBox(height: 32),
          const Text("Today's Timetable", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
          const SizedBox(height: 16),
          
          ClayTimeline(items: _timetableSlots),

          const SizedBox(height: 32),
          const Text("Course Syllabus", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
          const SizedBox(height: 16),
          
          if (_courses.isEmpty)
             const ClayEmptyState(title: "No Courses", message: "Your child is not enrolled in any courses with a syllabus.", icon: Icons.library_books)
          else
             ..._courses.map((course) {
               final subName = course['title'] ?? 'Subject';
               return Padding(
                 padding: const EdgeInsets.only(bottom: 16),
                 child: ClayCard(
                   padding: const EdgeInsets.all(16),
                   child: Row(
                     children: [
                       const Icon(Icons.picture_as_pdf, color: Colors.blueAccent, size: 36),
                       const SizedBox(width: 16),
                       Expanded(
                         child: Column(
                           crossAxisAlignment: CrossAxisAlignment.start,
                           children: [
                             Text('$subName Syllabus', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: ClayTheme.textDark)),
                             const SizedBox(height: 4),
                             const Text('Read-only Parent View', style: TextStyle(color: ClayTheme.textLight, fontSize: 12)),
                           ],
                         ),
                       ),
                       IconButton(
                         icon: const Icon(Icons.download, color: ClayTheme.primary),
                         onPressed: () async {
                           try {
                             final latestRes = await ApiClient.get(context, '/courses/${course['id']}/syllabus');
                             if (latestRes.statusCode == 200) {
                               final syllabusId = json.decode(latestRes.body)['id'];
                               final urlRes = await ApiClient.get(context, '/courses/${course['id']}/syllabus/$syllabusId/download');
                               if (urlRes.statusCode == 200) {
                                  final url = json.decode(urlRes.body)['url'];
                                  if (url != null && context.mounted) {
                                     await PdfViewerService.launchRemotePdf(context, url);
                                     return;
                                  }
                               }
                             }
                             if (context.mounted) {
                               ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Syllabus unavailable'), backgroundColor: ClayTheme.warning));
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
             }),

          const SizedBox(height: 32),
          const Text("Course Materials", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
          const SizedBox(height: 16),
          
          if (_courses.isEmpty)
             const ClayEmptyState(title: "Empty", message: "Your child has no courses assigned.", icon: Icons.folder)
          else
             ..._courses.map((course) {
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
                             const Text('View assigned documents', style: TextStyle(color: ClayTheme.textLight, fontSize: 12)),
                           ],
                         ),
                       ),
                       ClayButton(
                         onPressed: () {
                           ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Materials linked above in Academics section for demo.')));
                         },
                         child: const Text('OPEN', style: TextStyle(fontSize: 12)),
                       ),
                     ],
                   ),
                 ),
               );
             }),
        ],
      ),
    );
  }
}
