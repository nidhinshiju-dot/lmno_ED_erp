import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:school_erp_mobile_core/school_erp_mobile_core.dart';
import 'package:go_router/go_router.dart';

class ProfileTab extends StatelessWidget {
  const ProfileTab({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;
    
    final name = user?['name'] ?? 'Staff Member';
    final email = user?['email'] ?? 'teacher@lmno.edu';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(height: 20),
          ClayContainer(
            borderRadius: BorderRadius.circular(100),
            padding: const EdgeInsets.all(32),
            color: ClayTheme.primary.withOpacity(0.05),
            child: const Icon(Icons.assignment_ind, size: 80, color: ClayTheme.primary),
          ),
          const SizedBox(height: 24),
          Text(name, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
          const SizedBox(height: 8),
          Text(email, style: const TextStyle(color: ClayTheme.textLight, fontSize: 16)),
          const SizedBox(height: 16),
          ClayStatusChip(label: auth.role, color: ClayTheme.primary),
          
          const SizedBox(height: 48),

          _buildSettingsRow(Icons.lock_outline, 'Change Password', () {}),
          const SizedBox(height: 16),
          _buildSettingsRow(Icons.school, 'Academic Setup', () {}),
          const SizedBox(height: 16),
          _buildSettingsRow(Icons.notifications_none, 'Notification Preferences', () {}),
          const SizedBox(height: 16),
          _buildSettingsRow(Icons.help_outline, 'Help & Support', () {}),

          const SizedBox(height: 48),
          
          SizedBox(
            width: double.infinity,
            child: ClayButton(
              onPressed: () async {
                final confirm = await showDialog<bool>(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Logout'),
                    content: const Text('Are you sure you want to log out of the Teacher Portal?'),
                    actions: [
                      TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
                      TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Logout', style: TextStyle(color: Colors.red))),
                    ],
                  ),
                );

                if (confirm == true && context.mounted) {
                  telemetry.logEvent('LOGOUT_TRIGGERED', properties: {'role': 'TEACHER'});
                  await auth.logout();
                  if (context.mounted) {
                    context.go('/splash');
                  }
                }
              },
              color: ClayTheme.danger,
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.logout, color: Colors.white),
                  SizedBox(width: 8),
                  Text('LOGOUT OUT SECURELY', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildSettingsRow(IconData icon, String title, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: ClayCard(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(icon, color: ClayTheme.textLight),
            const SizedBox(width: 16),
            Expanded(child: Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: ClayTheme.textDark))),
            const Icon(Icons.chevron_right, color: ClayTheme.textLight),
          ],
        ),
      ),
    );
  }
}
