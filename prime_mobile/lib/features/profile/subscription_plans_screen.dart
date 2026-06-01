import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme.dart';
import '../../core/socket_service.dart';

class SubscriptionPlansScreen extends ConsumerStatefulWidget {
  const SubscriptionPlansScreen({super.key});

  @override
  ConsumerState<SubscriptionPlansScreen> createState() => _SubscriptionPlansScreenState();
}

class _SubscriptionPlansScreenState extends ConsumerState<SubscriptionPlansScreen> {
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchPackages();
  }

  Future<void> _fetchPackages() async {
    setState(() {
      _isLoading = true;
    });
    try {
      final baseUrl = ref.read(backendUrlProvider);
      await ref.read(socketServiceProvider).fetchPackages(baseUrl);
      
      final prefs = await SharedPreferences.getInstance();
      final String? token = prefs.getString('auth_token');
      if (token != null) {
        await ref.read(socketServiceProvider).fetchUserProfile(baseUrl, token);
      }
    } catch (e) {
      debugPrint('Error fetching packages: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final userTier = ref.watch(userTierProvider);
    final bool isPro = userTier == 'pro';
    final packages = ref.watch(packagesListProvider);

    // If still loading and packages is empty, show loading indicator.
    if (_isLoading && packages.isEmpty) {
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
        body: const Center(
          child: CircularProgressIndicator(
            color: AppTheme.primary,
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white),
            onPressed: _fetchPackages,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchPackages,
        color: AppTheme.primary,
        backgroundColor: AppTheme.secondaryBackground,
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
          physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
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

              if (packages.isEmpty) ...[
                const SizedBox(height: 40),
                const Icon(Icons.info_outline_rounded, color: AppTheme.textSecondary, size: 48),
                const SizedBox(height: 16),
                const Text(
                  'No subscription plans available.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Please pull down to refresh or check database seeding.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                ),
                const SizedBox(height: 40),
              ] else ...[
                // Dynamic Plan Cards from Database
                ...packages.map((package) {
                  final String name = package['name'] ?? 'Plan';
                  final String price = '₹${package['price'] ?? ''}';
                  final List<dynamic> features = package['features'] ?? [];
                  final String badge = package['badge'] ?? '';
                  final int duration = package['durationInDays'] ?? 30;

                  final bool isPkgPro = name.toLowerCase().contains('pro') ||
                                        name.toLowerCase().contains('gold') ||
                                        name.toLowerCase().contains('premium');
                  final bool isPlanActive = isPro && isPkgPro;

                  return Column(
                    children: [
                      const SizedBox(height: 24),
                      Container(
                        padding: const EdgeInsets.all(24.0),
                        decoration: BoxDecoration(
                          color: AppTheme.secondaryBackground,
                          borderRadius: BorderRadius.circular(28),
                          border: Border.all(
                            color: isPkgPro 
                                ? AppTheme.primary.withValues(alpha: 0.3)
                                : Colors.white.withValues(alpha: 0.05),
                          ),
                          boxShadow: isPkgPro ? [
                            BoxShadow(
                              color: AppTheme.primary.withValues(alpha: 0.03),
                              blurRadius: 20,
                              spreadRadius: 2,
                            )
                          ] : null,
                        ),
                        child: Stack(
                          children: [
                            if (badge.isNotEmpty)
                              Align(
                                alignment: Alignment.topRight,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: isPkgPro ? AppTheme.primary : AppTheme.success,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    badge.toUpperCase(),
                                    style: const TextStyle(
                                      color: Colors.black, 
                                      fontSize: 8, 
                                      fontWeight: FontWeight.w900, 
                                      letterSpacing: 0.5,
                                    ),
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
                                        color: (isPkgPro ? AppTheme.primary : AppTheme.success).withValues(alpha: 0.1),
                                        shape: BoxShape.circle,
                                      ),
                                      child: Icon(
                                        isPkgPro ? Icons.workspace_premium_rounded : Icons.flash_on_rounded, 
                                        color: isPkgPro ? AppTheme.primary : AppTheme.success, 
                                        size: 16,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      name.toUpperCase(),
                                      style: TextStyle(
                                        color: isPkgPro ? AppTheme.primary : Colors.white, 
                                        fontSize: 12, 
                                        fontWeight: FontWeight.bold, 
                                        letterSpacing: 1.0,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.baseline,
                                  textBaseline: TextBaseline.alphabetic,
                                  children: [
                                    Text(
                                      price,
                                      style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900),
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      duration == 30 ? '/ month' : '/ $duration days',
                                      style: TextStyle(color: AppTheme.textSecondary.withValues(alpha: 0.6), fontSize: 10, fontWeight: FontWeight.bold),
                                    ),
                                  ],
                                ),
                                Text(
                                  isPkgPro ? 'Full access to everything' : 'Essential features',
                                  style: const TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 16),
                                const Divider(color: Colors.white10),
                                const SizedBox(height: 16),
                                
                                // Features list
                                ...features.map((feat) => _buildFeatureItem(feat.toString(), isPro: isPkgPro)),
                                
                                const SizedBox(height: 24),
                                
                                // Button
                                GestureDetector(
                                  onTap: () async {
                                    if (isPlanActive) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(
                                          content: Text('$name is already active.'),
                                          backgroundColor: AppTheme.primary,
                                        ),
                                      );
                                      return;
                                    }
                                    
                                    try {
                                      final prefs = await SharedPreferences.getInstance();
                                      final String? token = prefs.getString('auth_token');
                                      final String baseUrl = ref.read(backendUrlProvider);

                                      if (!context.mounted) return;

                                      if (token == null) {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(
                                            content: Text('Authentication required.'),
                                            backgroundColor: AppTheme.error,
                                          ),
                                        );
                                        return;
                                      }

                                      final packageId = package['_id'] ?? package['id'];
                                      final checkoutUrl = Uri.parse('$baseUrl/api/v1/subscriptions/checkout?packageId=$packageId&token=$token');
                                      bool launched = false;
                                       try {
                                         launched = await launchUrl(checkoutUrl, mode: LaunchMode.externalApplication);
                                       } catch (e) {
                                         launched = false;
                                       }

                                       if (launched || await canLaunchUrl(checkoutUrl)) {
                                         if (!launched) {
                                           await launchUrl(checkoutUrl, mode: LaunchMode.externalApplication);
                                         }
                                         
                                         // Show refresh helper dialog to sync active subscription
                                         if (context.mounted) {
                                          showDialog(
                                            context: context,
                                            builder: (context) => AlertDialog(
                                              backgroundColor: AppTheme.secondaryBackground,
                                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                                              title: const Text(
                                                'Checkout Launched',
                                                style: TextStyle(color: Colors.white, fontFamily: 'Outfit', fontWeight: FontWeight.bold),
                                              ),
                                              content: const Text(
                                                'We have opened checkout in your browser. Once the purchase is completed, tap "Sync Subscription" below to activate your premium benefits.',
                                                style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                                              ),
                                              actions: [
                                                TextButton(
                                                  onPressed: () => Navigator.of(context).pop(),
                                                  child: const Text('Cancel', style: TextStyle(color: AppTheme.textSecondary)),
                                                ),
                                                ElevatedButton(
                                                  style: ElevatedButton.styleFrom(
                                                    backgroundColor: AppTheme.primary,
                                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                                  ),
                                                  onPressed: () async {
                                                    Navigator.of(context).pop();
                                                    // Show progress indicator
                                                    showDialog(
                                                      context: context,
                                                      barrierDismissible: false,
                                                      builder: (context) => const Center(
                                                        child: CircularProgressIndicator(color: AppTheme.primary),
                                                      ),
                                                    );
                                                    
                                                    // Sync user profile
                                                    await ref.read(socketServiceProvider).fetchUserProfile(baseUrl, token);
                                                    
                                                    if (context.mounted) {
                                                      Navigator.of(context).pop(); // Dismiss spinner
                                                      ScaffoldMessenger.of(context).showSnackBar(
                                                        const SnackBar(
                                                          content: Text('Subscription status synchronized successfully.'),
                                                          backgroundColor: AppTheme.success,
                                                        ),
                                                      );
                                                    }
                                                  },
                                                  child: const Text('Sync Subscription', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                                                ),
                                              ],
                                            ),
                                          );
                                        }
                                      } else {
                                        if (context.mounted) {
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            const SnackBar(
                                              content: Text('Could not launch checkout URL.'),
                                              backgroundColor: AppTheme.error,
                                            ),
                                          );
                                        }
                                      }
                                    } catch (e) {
                                      if (context.mounted) {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          SnackBar(
                                            content: Text('Error launching checkout: $e'),
                                            backgroundColor: AppTheme.error,
                                          ),
                                        );
                                      }
                                    }
                                  },
                                  child: Container(
                                    width: double.infinity,
                                    height: 52,
                                    decoration: BoxDecoration(
                                      color: isPlanActive ? Colors.white.withValues(alpha: 0.05) : AppTheme.primary,
                                      borderRadius: BorderRadius.circular(16),
                                      border: isPlanActive ? Border.all(color: AppTheme.primary.withValues(alpha: 0.2)) : null,
                                      boxShadow: isPlanActive ? null : [
                                        BoxShadow(
                                          color: AppTheme.primary.withValues(alpha: 0.15),
                                          blurRadius: 10,
                                          offset: const Offset(0, 4),
                                        )
                                      ]
                                    ),
                                    alignment: Alignment.center,
                                    child: Text(
                                      isPlanActive ? 'Active Plan' : 'Upgrade to $name',
                                      style: TextStyle(
                                        color: isPlanActive ? AppTheme.primary : Colors.black, 
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
                    ],
                  );
                }),
              ],
              
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
