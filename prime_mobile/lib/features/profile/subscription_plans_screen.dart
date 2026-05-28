import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../core/design_system.dart';
import '../../core/socket_service.dart';

class SubscriptionPlansScreen extends ConsumerWidget {
  const SubscriptionPlansScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userTier = ref.watch(userTierProvider);
    final bool isPro = userTier == 'pro';
    final packages = ref.watch(packagesListProvider);

    final proPackage = packages.firstWhere(
      (p) => p['name'].toString().toLowerCase().contains('pro') ||
             p['name'].toString().toLowerCase().contains('gold') ||
             p['name'].toString().toLowerCase().contains('premium'),
      orElse: () => null,
    );

    final String proPrice = proPackage != null ? '₹${proPackage['price']}' : '₹4,999';

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // CHOOSE PLAN OUTLINE BADGE
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.primary.withValues(alpha: 0.3)),
                color: AppTheme.primary.withValues(alpha: 0.05),
              ),
              child: const Text(
                'Choose Your Plan',
                style: TextStyle(color: AppTheme.primary, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.0),
              ),
            ),
            const SizedBox(height: 16),
            
            // MAIN TITLE
            const Text(
              'Get the Timing Advantage',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'Outfit',
                fontSize: 26,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 12),
            
            // SUBTITLE
            const Text(
              'Most traders enter after the move is already gone. Upgrade to capture setups in real-time.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppTheme.textSecondary, fontSize: 12, height: 1.4),
            ),
            const SizedBox(height: 28),

            // Plan Card 1: FREE
            Container(
              padding: const EdgeInsets.all(24.0),
              decoration: BoxDecoration(
                color: AppTheme.secondaryBackground,
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.05),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.flash_on_rounded, color: AppTheme.textSecondary, size: 16),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'FREE',
                        style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.0),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    '₹0',
                    style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900),
                  ),
                  const Text(
                    'Get a taste of PRIMETRADE',
                    style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  const Divider(color: Colors.white10),
                  const SizedBox(height: 16),
                  
                  // Features list with checkmarks
                  _buildFeatureItem('Delayed signals (5 min)', isPro: false),
                  _buildFeatureItem('Blurred entry levels', isPro: false),
                  _buildFeatureItem('Limited signal history', isPro: false),
                  _buildFeatureItem('Basic market intelligence', isPro: false),
                  
                  const SizedBox(height: 24),
                  
                  // Button
                  Container(
                    width: double.infinity,
                    height: 52,
                    decoration: BoxDecoration(
                      color: !isPro ? Colors.white.withValues(alpha: 0.02) : Colors.transparent,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      !isPro ? 'Current Plan' : 'Free Tier Active',
                      style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 24),

            // Plan Card 2: PRO
            Container(
              padding: const EdgeInsets.all(24.0),
              decoration: BoxDecoration(
                color: AppTheme.secondaryBackground,
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: AppTheme.primary.withValues(alpha: 0.3)),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primary.withValues(alpha: 0.03),
                    blurRadius: 20,
                    spreadRadius: 2,
                  )
                ],
              ),
              child: Stack(
                children: [
                  // Popular badge
                  Align(
                    alignment: Alignment.topRight,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppTheme.primary,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        'POPULAR',
                        style: TextStyle(color: Colors.black, fontSize: 8, fontWeight: FontWeight.w900, letterSpacing: 0.5),
                      ),
                    ),
                  ),
                  
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: AppTheme.primary.withValues(alpha: 0.1),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.workspace_premium_rounded, color: AppTheme.primary, size: 16),
                          ),
                          const SizedBox(width: 8),
                          const Text(
                            'PRO',
                            style: TextStyle(color: AppTheme.primary, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.0),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text(
                            proPrice,
                            style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '/ month',
                            style: TextStyle(color: AppTheme.textSecondary.withValues(alpha: 0.6), fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const Text(
                        'Full access to everything',
                        style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 16),
                      const Divider(color: Colors.white10),
                      const SizedBox(height: 16),
                      
                      // Features list
                      _buildFeatureItem('Real-time signals (instant)', isPro: true),
                      _buildFeatureItem('Full entry, SL & target levels', isPro: true),
                      _buildFeatureItem('Unlimited signal history', isPro: true),
                      _buildFeatureItem('AI guidance & reasoning', isPro: true),
                      _buildFeatureItem('Instant push alerts', isPro: true),
                      _buildFeatureItem('VIP Telegram access', isPro: true),
                      _buildFeatureItem('Advanced market analytics', isPro: true),
                      _buildFeatureItem('Priority support', isPro: true),
                      
                      const SizedBox(height: 24),
                      
                      // Button
                      GestureDetector(
                        onTap: () {
                          if (isPro) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Pro Subscription is already active.'),
                                backgroundColor: AppTheme.primary,
                              ),
                            );
                            return;
                          }
                          
                          ref.read(userTierProvider.notifier).state = 'pro';
                          
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('PRO Access Unlocked! Welcome to PRIMETRADE Pro.'),
                              backgroundColor: AppTheme.success,
                            ),
                          );
                          Navigator.of(context).pop();
                        },
                        child: Container(
                          width: double.infinity,
                          height: 52,
                          decoration: BoxDecoration(
                            color: isPro ? Colors.white.withValues(alpha: 0.05) : AppTheme.primary,
                            borderRadius: BorderRadius.circular(16),
                            border: isPro ? Border.all(color: AppTheme.primary.withValues(alpha: 0.2)) : null,
                            boxShadow: isPro ? null : [
                              BoxShadow(
                                color: AppTheme.primary.withValues(alpha: 0.15),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              )
                            ]
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            isPro ? 'Pro Active' : 'Upgrade to Pro',
                            style: TextStyle(
                              color: isPro ? AppTheme.primary : Colors.black, 
                              fontSize: 12, 
                              fontWeight: FontWeight.w900, 
                              letterSpacing: 0.5
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Center(
                        child: Text(
                          '7-day money back guarantee • Cancel anytime',
                          style: TextStyle(color: AppTheme.textSecondary.withValues(alpha: 0.6), fontSize: 9, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 32),

            // WHY UPGRADE NOW
            const Align(
              alignment: Alignment.center,
              child: Text(
                'Why upgrade now?',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppTheme.textSecondary, letterSpacing: 2.0),
              ),
            ),
            const SizedBox(height: 16),
            
            // Grid metrics
            _buildMetricTile(
              value: '68%',
              label: 'Average signal success rate',
              color: AppTheme.success,
            ),
            const SizedBox(height: 12),
            _buildMetricTile(
              value: '+₹2.4L',
              label: 'Avg monthly profit (Pro users)',
              color: AppTheme.primary,
            ),
            const SizedBox(height: 12),
            _buildMetricTile(
              value: '4.2 min',
              label: 'Average time to first target',
              color: AppTheme.error,
            ),
            
            const SizedBox(height: 32),

            // Security Badge
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.shield_outlined, color: AppTheme.textSecondary.withValues(alpha: 0.5), size: 14),
                const SizedBox(width: 6),
                Text(
                  'Institutional Security Shield Connected',
                  style: TextStyle(
                    fontSize: 8,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textSecondary.withValues(alpha: 0.5),
                    letterSpacing: 1.0,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureItem(String text, {required bool isPro}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10.0),
      child: Row(
        children: [
          Container(
            width: 14,
            height: 14,
            decoration: BoxDecoration(
              color: isPro ? AppTheme.primary.withValues(alpha: 0.1) : AppTheme.success.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: Icon(
              Icons.check, 
              color: isPro ? AppTheme.primary : AppTheme.success, 
              size: 10
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                color: isPro ? AppTheme.primary.withValues(alpha: 0.9) : Colors.white70,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricTile({
    required String value,
    required String label,
    required Color color,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(
        color: AppTheme.secondaryBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(color: color, fontSize: 24, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}
