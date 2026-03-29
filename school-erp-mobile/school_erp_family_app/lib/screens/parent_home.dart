import 'package:flutter/material.dart';
import 'package:school_erp_mobile_core/school_erp_mobile_core.dart';
import 'child_tab.dart';
import 'fees_tab.dart';
import 'profile_tab.dart';

class ParentHome extends StatefulWidget {
  const ParentHome({super.key});

  @override
  State<ParentHome> createState() => _ParentHomeState();
}

class _ParentHomeState extends State<ParentHome> {
  int _currentIndex = 0;

  final List<Widget> _tabs = [
    const _ParentDashboardTab(),
    const ChildTab(),
    const FeesTab(),
    const NoticesBoard(isTeacher: false),
    const ProfileTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Parent Portal'),
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
          BottomNavigationBarItem(icon: Icon(Icons.child_care_outlined), activeIcon: Icon(Icons.child_care), label: 'Child'),
          BottomNavigationBarItem(icon: Icon(Icons.receipt_outlined), activeIcon: Icon(Icons.receipt), label: 'Fees'),
          BottomNavigationBarItem(icon: Icon(Icons.campaign_outlined), activeIcon: Icon(Icons.campaign), label: 'Notices'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}

class _ParentDashboardTab extends StatelessWidget {
  const _ParentDashboardTab();

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Welcome, Parent', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
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
                    Text('Child Status', style: TextStyle(color: Colors.white70, fontSize: 12)),
                    SizedBox(height: 4),
                    Text('In School', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                    SizedBox(height: 4),
                    Text('Next: Chemistry at 09:40 AM', style: TextStyle(color: Colors.white70, fontSize: 14)),
                  ],
                ),
                ClayContainer(
                  depth: true,
                  emboss: true,
                  color: Colors.white.withOpacity(0.2),
                  padding: const EdgeInsets.all(12),
                  borderRadius: BorderRadius.circular(16),
                  child: const Icon(Icons.school, color: Colors.white, size: 32),
                )
              ],
            ),
          ),
          
          const SizedBox(height: 32),
          const Text('At a Glance', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
          const SizedBox(height: 16),
          
          Row(
            children: [
              Expanded(child: _QuickActionCard(icon: Icons.calendar_today, title: 'Schedule', onTap: () {
                final state = context.findAncestorStateOfType<_ParentHomeState>();
                state?.setState(() => state._currentIndex = 1); // Switch to Child
              })),
              const SizedBox(width: 16),
              Expanded(child: _QuickActionCard(icon: Icons.receipt_long, title: 'Fees Dues', onTap: () {
                final state = context.findAncestorStateOfType<_ParentHomeState>();
                state?.setState(() => state._currentIndex = 2); // Switch to Fees
              })),
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
