import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../core/design_system.dart';

class NotificationCenterScreen extends StatelessWidget {
  const NotificationCenterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> notifications = [
      {
        'title': 'NIFTY 23500 CE Target Achieved',
        'desc': 'Option target hit at ₹310.00. Net profit expansion completed.',
        'time': 'Just now',
        'icon': Icons.check_circle_rounded,
        'iconColor': AppTheme.success,
      },
      {
        'title': 'New Signal Alert: BANKNIFTY',
        'desc': 'BANKNIFTY 52200 PE buy alert triggered. Entry ₹410.00, target ₹520.00.',
        'time': '34 mins ago',
        'icon': Icons.radar_outlined,
        'iconColor': AppTheme.primary,
      },
      {
        'title': 'India VIX Volatility Spike',
        'desc': 'VIX expansion detected. High fluctuation warning active. Adjust stop losses.',
        'time': '2 hours ago',
        'icon': Icons.warning_amber_rounded,
        'iconColor': AppTheme.warning,
      },
      {
        'title': 'FII Block Order Cumulative Buy',
        'desc': 'Cumulative net FII buying imbalance exceeds ₹1,200 Cr in index derivatives.',
        'time': '3 hours ago',
        'icon': Icons.insights_outlined,
        'iconColor': AppTheme.secondary,
      }
    ];

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'Notifications Log',
          style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
        itemCount: notifications.length,
        itemBuilder: (context, index) {
          final item = notifications[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: 12.0),
            child: GlassCard(
              padding: const EdgeInsets.all(16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: item['iconColor'].withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(item['icon'], color: item['iconColor'], size: 18),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              item['title'],
                              style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 13),
                            ),
                            Text(
                              item['time'],
                              style: const TextStyle(color: AppTheme.textSecondary, fontSize: 9),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          item['desc'],
                          style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11, height: 1.4),
                        ),
                      ],
                    ),
                  )
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
