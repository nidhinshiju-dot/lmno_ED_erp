import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:school_erp_mobile_core/school_erp_mobile_core.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ClayContainer(
                  borderRadius: BorderRadius.circular(100),
                  padding: const EdgeInsets.all(40),
                  child: const Icon(Icons.assignment_ind, size: 100, color: ClayTheme.primary),
                ),
                const SizedBox(height: 60),
                Text('Welcome LMNO Teachers!', style: Theme.of(context).textTheme.headlineMedium, textAlign: TextAlign.center),
                const SizedBox(height: 20),
                Text('Manage your classes, students, and curriculum seamlessly.', style: Theme.of(context).textTheme.bodyMedium, textAlign: TextAlign.center),
                const SizedBox(height: 60),
                SizedBox(
                  width: double.infinity,
                  child: ClayButton(
                    onPressed: () => context.go('/login'),
                    child: const Text('Login securely'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
