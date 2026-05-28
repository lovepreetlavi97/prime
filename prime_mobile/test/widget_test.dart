// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:prime_mobile/main.dart';
import 'package:prime_mobile/core/socket_service.dart';

class MockSocketService extends SocketService {
  @override
  void init(WidgetRef ref) {
    // No-op for testing to prevent actual socket connection and pending Timers
  }

  @override
  void disconnect() {
    // No-op
  }
}

void main() {
  testWidgets('Dashboard loads successfully', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          socketServiceProvider.overrideWithValue(MockSocketService()),
        ],
        child: const LVPrimeXApp(),
      ),
    );

    // Verify that the dashboard title is displayed.
    expect(find.text('LVPrimeX'), findsOneWidget);
  });
}
