import 'package:flutter/material.dart';
import 'clay_theme.dart';
import 'clay_container.dart';

class ClayEmptyState extends StatelessWidget {
  final String title;
  final String message;
  final IconData icon;

  const ClayEmptyState({
    super.key,
    required this.title,
    required this.message,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ClayContainer(
              depth: true,
              emboss: true,
              borderRadius: BorderRadius.circular(100),
              padding: const EdgeInsets.all(32),
              color: ClayTheme.background,
              child: Icon(icon, size: 64, color: ClayTheme.textLight.withOpacity(0.5)),
            ),
            const SizedBox(height: 24),
            Text(
              title,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: ClayTheme.textDark,
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              message,
              style: const TextStyle(color: ClayTheme.textLight, fontSize: 16),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
