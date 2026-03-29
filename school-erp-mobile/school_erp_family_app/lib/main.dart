import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:school_erp_mobile_core/school_erp_mobile_core.dart';
import 'screens/splash_screen.dart';
import 'screens/onboarding_screen.dart';
import 'screens/login_screen.dart';
import 'screens/student_home.dart';
import 'screens/parent_home.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: const FamilyApp(),
    ),
  );
}

final router = GoRouter(
  initialLocation: '/splash',
  routes: [
    GoRoute(path: '/splash', builder: (context, state) => const SplashScreen()),
    GoRoute(path: '/onboarding', builder: (context, state) => const OnboardingScreen()),
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(
      path: '/',
      builder: (context, state) {
        final auth = Provider.of<AuthProvider>(context, listen: false);
        if (auth.role == 'PARENT') return const ParentHome();
        return const StudentHome();
      },
    ),
  ],
  redirect: (context, state) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final isAuth = authProvider.isAuthenticated;
    final loc = state.matchedLocation;

    if (!isAuth && loc != '/login' && loc != '/splash' && loc != '/onboarding') return '/splash';
    if (isAuth && (loc == '/login' || loc == '/splash' || loc == '/onboarding')) return '/';
    return null;
  },
);

class FamilyApp extends StatelessWidget {
  const FamilyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'LMNO Family',
      theme: ClayTheme.lightTheme,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
