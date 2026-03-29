import 'package:flutter/material.dart';
import 'clay_theme.dart';
import 'clay_container.dart';
import 'clay_button.dart';

class ClayErrorState extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const ClayErrorState({
    super.key,
    required this.message,
    required this.onRetry,
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
              color: ClayTheme.danger.withOpacity(0.1),
              child: const Icon(Icons.wifi_off, size: 64, color: ClayTheme.danger),
            ),
            const SizedBox(height: 24),
            const Text(
              'Connection Error',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: ClayTheme.textDark),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              message,
              style: const TextStyle(color: ClayTheme.textLight, fontSize: 16),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: 200,
              child: ClayButton(
                onPressed: onRetry,
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.refresh, color: Colors.white),
                    SizedBox(width: 8),
                    Text('RETRY', style: TextStyle(fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}
