import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_core/firebase_core.dart';
import 'core/theme.dart';
import 'features/dashboard/dashboard_screen.dart';
import 'features/auth/otp_login_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint('Firebase initialization failed: $e');
  }
  runApp(const ProviderScope(child: LvxApp()));
}

class LvxApp extends ConsumerWidget {
  const LvxApp({super.key});

  static final GlobalKey<ScaffoldMessengerState> scaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp(
      title: 'LVX',
      scaffoldMessengerKey: scaffoldMessengerKey,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme, // We only use premium dark mode
      home: const LauncherWidget(),
    );
  }
}

class LauncherWidget extends ConsumerStatefulWidget {
  const LauncherWidget({super.key});

  @override
  ConsumerState<LauncherWidget> createState() => _LauncherWidgetState();
}

class _LauncherWidgetState extends ConsumerState<LauncherWidget> {
  bool _checked = false;
  bool _hasToken = false;

  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  void _checkAuth() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    setState(() {
      _hasToken = token != null;
      _checked = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!_checked) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: AppTheme.primary),
        ),
      );
    }
    return _hasToken ? const DashboardScreen() : const OtpLoginScreen();
  }
}
