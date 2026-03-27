import 'package:flutter/material.dart';
import 'package:school_erp_mobile_core/school_erp_mobile_core.dart';
import 'profile_tab.dart';
import 'attendance_tab.dart';
import 'leave_approval_screen.dart' as leavepkg;
import 'syllabus_management_screen.dart';
import 'materials_management_screen.dart';

class TeacherHome extends StatefulWidget {
  const TeacherHome({super.key});

  @override
  State<TeacherHome> createState() => _TeacherHomeState();
}

class _TeacherHomeState extends State<TeacherHome> {
  int _currentIndex = 0;

  final List<Widget> _tabs = [
    const _TeacherDashboardTab(),
    const Center(child: Text("Students Placeholder")),
    const _TeacherCoursesTab(),
    const AttendanceTab(),
    const ProfileTab(),
  ];
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Teacher Portal'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: ClayTheme.primary),
            onPressed: () {},
          )
        ],
      ),
      body: _tabs[_currentIndex],
      bottomNavigationBar: ClayBottomNav(
        selectedIndex: _currentIndex,
        onItemSelected: (i) => setState(() => _currentIndex = i),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.campaign_outlined), activeIcon: Icon(Icons.campaign), label: 'Notices'),
          BottomNavigationBarItem(icon: Icon(Icons.people_outlined), activeIcon: Icon(Icons.people), label: 'Students'),
          BottomNavigationBarItem(icon: Icon(Icons.book_outlined), activeIcon: Icon(Icons.book), label: 'Courses'),
          BottomNavigationBarItem(icon: Icon(Icons.fact_check_outlined), activeIcon: Icon(Icons.fact_check), label: 'Attendance'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}

class _TeacherDashboardTab extends StatelessWidget {
  const _TeacherDashboardTab();

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Welcome, Teacher', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
          const SizedBox(height: 24),
          
          ClayContainer(
            padding: const EdgeInsets.all(24),
            borderRadius: BorderRadius.circular(20),
            color: ClayTheme.primary,
            depth: true,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Active Class', style: TextStyle(color: Colors.white70, fontSize: 12)),
                    SizedBox(height: 4),
                    Text('Class 10-A', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                    SizedBox(height: 4),
                    Text('Next: Chemistry (11:00 AM)', style: TextStyle(color: Colors.white70, fontSize: 14)),
                  ],
                ),
                ClayContainer(
                  depth: true, emboss: true, color: Colors.white.withOpacity(0.2), padding: const EdgeInsets.all(12), borderRadius: BorderRadius.circular(16),
                  child: const Icon(Icons.school, color: Colors.white, size: 32),
                )
              ],
            ),
          ),
          
          const SizedBox(height: 32),
          const Text('Quick Access', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
          const SizedBox(height: 16),
          
          Row(
            children: [
              Expanded(child: GestureDetector(
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NoticesBoard(isTeacher: true))),
                child: ClayCard(padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16), child: Column(children: [Icon(Icons.campaign, color: ClayTheme.primary, size: 32), const SizedBox(height: 16), const Text('Notices', style: TextStyle(fontWeight: FontWeight.bold, color: ClayTheme.textDark))])),
              )),
              const SizedBox(width: 16),
              Expanded(child: GestureDetector(
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => importLeaveScreen())), // Placeholder to evaluate import next
                child: ClayCard(padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16), child: Column(children: [Icon(Icons.assignment_turned_in, color: ClayTheme.primary, size: 32), const SizedBox(height: 16), const Text('Leaves', style: TextStyle(fontWeight: FontWeight.bold, color: ClayTheme.textDark))])),
              )),
            ],
          ),
        ],
      ),
    );
  }

  Widget importLeaveScreen() => const leavepkg.LeaveApprovalScreen();
}

class _TeacherCoursesTab extends StatelessWidget {
  const _TeacherCoursesTab();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const Text('Assigned Courses', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
        const SizedBox(height: 16),
        ClayCard(
          padding: const EdgeInsets.all(16),
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SyllabusManagementScreen(courseId: 'COURSE_101', courseName: 'Class 10 Physics'))),
          child: const Row(
            children: [
              Icon(Icons.science, color: ClayTheme.primary, size: 36),
              SizedBox(width: 16),
              Expanded(child: Text('Class 10 Physics Syllabus', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: ClayTheme.textDark))),
              Icon(Icons.upload_file, color: ClayTheme.textLight),
            ],
          ),
        ),
        const SizedBox(height: 16),
        ClayCard(
          padding: const EdgeInsets.all(16),
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MaterialsManagementScreen(courseId: 'COURSE_101', courseName: 'Class 10 Physics'))),
          child: const Row(
            children: [
              Icon(Icons.folder_open, color: ClayTheme.primary, size: 36),
              SizedBox(width: 16),
              Expanded(child: Text('Class 10 Physics Materials', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: ClayTheme.textDark))),
              Icon(Icons.upload_file, color: ClayTheme.textLight),
            ],
          ),
        ),
      ],
    );
  }
}
