import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme.dart';
import 'features/dashboard/dashboard_screen.dart';

void main() {
  runApp(const ProviderScope(child: PrimeTradeApp()));
}

class PrimeTradeApp extends StatelessWidget {
  const PrimeTradeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PrimeTrade',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme, // We only use premium dark mode
      home: const DashboardScreen(),
    );
  }
}
