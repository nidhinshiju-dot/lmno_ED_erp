import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';

class ProfileTab extends StatelessWidget {
  const ProfileTab({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const SizedBox(height: 20),
        // Avatar
        Center(
          child: CircleAvatar(
            radius: 48,
            backgroundColor: theme.colorScheme.primaryContainer,
            child: Icon(Icons.person, size: 48, color: theme.colorScheme.onPrimaryContainer),
          ),
        ),
        const SizedBox(height: 16),
        Center(
          child: Text(
            'Student',
            style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          ),
        ),
        Center(
          child: Text(
            'student@school.com',
            style: theme.textTheme.bodyMedium?.copyWith(color: Colors.grey),
          ),
        ),
        const SizedBox(height: 32),

        // Settings Section
        _ProfileTile(
          icon: Icons.notifications_outlined,
          title: 'Notifications',
          onTap: () {},
        ),
        _ProfileTile(
          icon: Icons.language,
          title: 'Language',
          trailing: 'English',
          onTap: () {},
        ),
        _ProfileTile(
          icon: Icons.dark_mode_outlined,
          title: 'Dark Mode',
          trailing: 'System',
          onTap: () {},
        ),
        _ProfileTile(
          icon: Icons.info_outline,
          title: 'About',
          onTap: () {},
        ),
        const SizedBox(height: 24),

        // Logout Button
        FilledButton.tonal(
          onPressed: () {
            Provider.of<AuthProvider>(context, listen: false).logout();
            context.go('/login');
          },
          style: FilledButton.styleFrom(
            backgroundColor: Colors.red.shade50,
            foregroundColor: Colors.red,
            minimumSize: const Size(double.infinity, 48),
          ),
          child: const Text('Sign Out'),
        ),
      ],
    );
  }
}

class _ProfileTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? trailing;
  final VoidCallback onTap;

  const _ProfileTile({
    required this.icon,
    required this.title,
    this.trailing,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      trailing: trailing != null
          ? Text(trailing!, style: TextStyle(color: Colors.grey.shade600))
          : const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}
