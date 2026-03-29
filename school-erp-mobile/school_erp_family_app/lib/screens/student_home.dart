import 'package:flutter/material.dart';
import 'package:school_erp_mobile_core/school_erp_mobile_core.dart';
import 'package:provider/provider.dart';
import 'academics_tab.dart';
import 'attendance_tab.dart';
import 'profile_tab.dart';
import 'leave_screen.dart';

class StudentHome extends StatefulWidget {
  const StudentHome({super.key});

  @override
  State<StudentHome> createState() => _StudentHomeState();
}

class _StudentHomeState extends State<StudentHome> {
  int _currentIndex = 0;

  final List<Widget> _tabs = [
    const _StudentDashboardTab(),
    const AcademicsTab(),
    const AttendanceTab(),
    const NoticesBoard(isTeacher: false),
    const ProfileTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Student Portal'),
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
          BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.book_outlined), activeIcon: Icon(Icons.book), label: 'Academics'),
          BottomNavigationBarItem(icon: Icon(Icons.check_circle_outline), activeIcon: Icon(Icons.check_circle), label: 'Attendance'),
          BottomNavigationBarItem(icon: Icon(Icons.campaign_outlined), activeIcon: Icon(Icons.campaign), label: 'Notices'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}

class _StudentDashboardTab extends StatelessWidget {
  const _StudentDashboardTab();

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final studentName = auth.user?['name'] ?? 'Student';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Welcome back, $studentName!', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
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
                    Text('Up Next', style: TextStyle(color: Colors.white70, fontSize: 12)),
                    SizedBox(height: 4),
                    Text('Physics Lab', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                    SizedBox(height: 4),
                    Text('08:50 AM - 09:35 AM', style: TextStyle(color: Colors.white70, fontSize: 14)),
                  ],
                ),
                ClayContainer(
                  depth: true,
                  emboss: true,
                  color: Colors.white.withOpacity(0.2),
                  padding: const EdgeInsets.all(12),
                  borderRadius: BorderRadius.circular(16),
                  child: const Icon(Icons.science, color: Colors.white, size: 32),
                )
              ],
            ),
          ),
          
          const SizedBox(height: 32),
          const Text('Quick Access', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
          const SizedBox(height: 16),
          
          Row(
            children: [
              Expanded(child: _QuickActionCard(icon: Icons.calendar_today, title: 'Timetable', onTap: () {
                final state = context.findAncestorStateOfType<_StudentHomeState>();
                state?.setState(() => state._currentIndex = 1); 
              })),
              const SizedBox(width: 16),
              Expanded(child: _QuickActionCard(icon: Icons.assignment, title: 'Homework', onTap: () {
                final state = context.findAncestorStateOfType<_StudentHomeState>();
                state?.setState(() => state._currentIndex = 1); 
              })),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: _QuickActionCard(icon: Icons.medical_services, title: 'Leave App', onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const LeaveScreen()));
              })),
              const SizedBox(width: 16),
              const Expanded(child: SizedBox()), // Placeholder
            ],
          ),
        ]
      )
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  const _QuickActionCard({required this.icon, required this.title, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: ClayCard(
        padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
        child: Column(
          children: [
            ClayContainer(
              depth: true,
              emboss: true,
              padding: const EdgeInsets.all(16),
              borderRadius: BorderRadius.circular(20),
              color: ClayTheme.primary.withOpacity(0.05),
              child: Icon(icon, color: ClayTheme.primary, size: 32),
            ),
            const SizedBox(height: 16),
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
          ],
        ),
      ),
    );
  }
}
