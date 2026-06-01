import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import '../../core/theme.dart';
import '../../core/socket_service.dart';
import '../auth/otp_login_screen.dart';
import '../signals/signals_list_view.dart';
import 'subscription_plans_screen.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final String userTier = ref.watch(userTierProvider);
    final bool isPro = userTier == 'pro';
    final currentUser = ref.watch(currentUserProvider);
    final signals = ref.watch(signalsListProvider);

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Align(
          alignment: Alignment.centerLeft,
          child: Text(
            'Profile',
            style: TextStyle(
              fontFamily: 'Outfit', 
              fontWeight: FontWeight.bold, 
              fontSize: 24,
              color: Colors.white,
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // User Meta Profile card
            _buildUserProfileCard(context, ref, currentUser, isPro),
            
            const SizedBox(height: 20),

            // List Options
            _buildListItem(
              context,
              icon: Icons.workspace_premium_rounded,
              title: 'Manage Subscription',
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const SubscriptionPlansScreen()),
                );
              },
            ),
            
            const SizedBox(height: 12),

            _buildListItem(
              context,
              icon: Icons.telegram_rounded,
              title: 'VIP Telegram',
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Opening VIP Telegram link...')),
                );
              },
            ),

            const SizedBox(height: 28),

            // Account Stats
            const Text(
              'Account Stats',
              style: TextStyle(
                fontSize: 16, 
                fontWeight: FontWeight.bold, 
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 12),
            _buildAccountStatsGrid(signals, isPro),
            
            const SizedBox(height: 32),
            
            // Log out link
            Center(
              child: TextButton(
                onPressed: () async {
                  final prefs = await SharedPreferences.getInstance();
                  await prefs.remove('auth_token');
                  await prefs.remove('user_phone');
                  await prefs.remove('user_plan');
                  
                  ref.read(userTierProvider.notifier).state = 'free';
                  ref.read(currentUserProvider.notifier).state = null;
                  ref.read(socketServiceProvider).disconnect();

                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Logged out of LVX terminal session.')),
                    );
                    Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute(builder: (_) => const OtpLoginScreen()),
                      (route) => false,
                    );
                  }
                },
                child: const Text(
                  'Disconnect Session',
                  style: TextStyle(color: AppTheme.error, fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUserProfileCard(BuildContext context, WidgetRef ref, Map<String, dynamic>? currentUser, bool isPro) {
    final String phone = currentUser?['phone'] ?? '+91 98765 43210';
    final String name = currentUser?['name'] ?? 'LVX Trader';
    
    final String displayInitial = name.trim().isNotEmpty ? name.trim()[0].toUpperCase() : 'L';

    String memberSince = 'Member since Jan 2024';
    if (currentUser?['createdAt'] != null) {
      try {
        final parsedDate = DateTime.parse(currentUser!['createdAt']);
        final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        memberSince = 'Member since ${months[parsedDate.month - 1]} ${parsedDate.year}';
      } catch (_) {}
    }

    return Container(
      padding: const EdgeInsets.all(20.0),
      decoration: BoxDecoration(
        color: AppTheme.secondaryBackground,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.primary,
                ),
                alignment: Alignment.center,
                child: Text(
                  displayInitial,
                  style: const TextStyle(
                    color: Colors.black, 
                    fontSize: 22, 
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            name,
                            style: const TextStyle(
                              fontSize: 18, 
                              fontWeight: FontWeight.bold, 
                              color: Colors.white,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: () => _showEditNameDialog(context, ref, name),
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: AppTheme.primary.withValues(alpha: 0.1),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.edit_outlined, 
                              color: AppTheme.primary, 
                              size: 14,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      phone,
                      style: const TextStyle(
                        fontSize: 12, 
                        fontWeight: FontWeight.bold, 
                        color: AppTheme.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      memberSince,
                      style: TextStyle(
                        color: AppTheme.textSecondary.withValues(alpha: 0.6), 
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              )
            ],
          ),
          const SizedBox(height: 24),
          const Divider(color: AppTheme.surfaceHighlight, height: 1),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Current Plan',
                    style: TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    isPro ? 'PRO' : 'FREE',
                    style: TextStyle(
                      color: isPro ? AppTheme.primary : Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
              if (!isPro)
                GestureDetector(
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const SubscriptionPlansScreen()),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppTheme.primary,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'Upgrade to Pro',
                      style: TextStyle(
                        color: Colors.black,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                )
              else
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    border: Border.all(color: AppTheme.primary.withValues(alpha: 0.3)),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'Active Plan',
                    style: TextStyle(
                      color: AppTheme.primary,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildListItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        decoration: BoxDecoration(
          color: AppTheme.secondaryBackground,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppTheme.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: AppTheme.primary, size: 18),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const Icon(
              Icons.arrow_forward_ios_rounded, 
              color: AppTheme.textSecondary, 
              size: 14,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAccountStatsGrid(List<SignalData> signals, bool isPro) {
    final int signalsCount = signals.length;
    final closedSignals = signals.where((s) => s.isClosed).toList();
    final int closedCount = closedSignals.length;
    final int profitCount = closedSignals.where((s) => s.isProfit).length;
    final int successRate = closedCount > 0 ? ((profitCount / closedCount) * 100).round() : 0;

    return Row(
      children: [
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.secondaryBackground,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Signals Received',
                  style: TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '$signalsCount',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.secondaryBackground,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Avg Success Rate',
                  style: TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '$successRate%',
                  style: const TextStyle(
                    color: AppTheme.success,
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  void _showEditNameDialog(BuildContext context, WidgetRef ref, String currentName) {
    final TextEditingController nameController = TextEditingController(text: currentName);
    bool isSaving = false;

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              backgroundColor: AppTheme.secondaryBackground,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
                side: const BorderSide(color: AppTheme.surfaceHighlight),
              ),
              title: const Text(
                'Edit Name',
                style: TextStyle(color: Colors.white, fontFamily: 'Outfit', fontWeight: FontWeight.bold),
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'FULL NAME',
                    style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: AppTheme.primary, letterSpacing: 2.0),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: AppTheme.background,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.surfaceHighlight),
                    ),
                    child: TextField(
                      controller: nameController,
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                      decoration: const InputDecoration(
                        hintText: 'Enter your name',
                        hintStyle: TextStyle(color: Colors.white24, fontSize: 13),
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: isSaving ? null : () => Navigator.of(context).pop(),
                  child: const Text('CANCEL', style: TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.bold)),
                ),
                TextButton(
                  onPressed: isSaving ? null : () async {
                    if (nameController.text.trim().isEmpty) return;
                    
                    setState(() {
                      isSaving = true;
                    });
                    
                    try {
                      final prefs = await SharedPreferences.getInstance();
                      final String? token = prefs.getString('auth_token');
                      final String baseUrl = ref.read(backendUrlProvider);
                      
                      if (token != null) {
                        final res = await http.post(
                          Uri.parse('$baseUrl/api/v1/profile/update'),
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer $token',
                          },
                          body: json.encode({'name': nameController.text.trim()}),
                        );
                        
                        final decoded = json.decode(res.body);
                        if (res.statusCode == 200 && decoded['success'] == true) {
                          // Update profile in socket service state
                          await ref.read(socketServiceProvider).fetchUserProfile(baseUrl, token);
                          
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Name updated successfully'), backgroundColor: AppTheme.success),
                            );
                            Navigator.of(context).pop();
                          }
                        } else {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text(decoded['error'] ?? 'Failed to update name'), backgroundColor: AppTheme.error),
                            );
                          }
                        }
                      }
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Error: $e'), backgroundColor: AppTheme.error),
                        );
                      }
                    } finally {
                      setState(() {
                        isSaving = false;
                      });
                    }
                  },
                  child: isSaving 
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primary))
                    : const Text('SAVE', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
                ),
              ],
            );
          },
        );
      },
    );
  }
}
