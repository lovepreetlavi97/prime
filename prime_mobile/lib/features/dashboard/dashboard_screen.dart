import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/theme.dart';
import '../../core/design_system.dart';
import '../../core/socket_service.dart';
import '../../shared/navigation/custom_bottom_navigation.dart';
import '../../shared/navigation/navigation_item.dart';
import '../signals/signals_list_view.dart';
import '../ai_insights/ai_insights_screen.dart';
import '../profile/profile_screen.dart';
import '../profile/subscription_plans_screen.dart';
import '../notifications/notification_center_screen.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  int _currentIndex = 0;
  final PageController _pageController = PageController();

  @override
  void initState() {
    super.initState();
    // Initialize sockets when app starts
    Future.microtask(() => ref.read(socketServiceProvider).init());
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _onTabChanged(int index) {
    if (_currentIndex != index) {
      setState(() {
        _currentIndex = index;
      });
      _pageController.animateToPage(
        index,
        duration: const Duration(milliseconds: 320),
        curve: Curves.easeOutCubic,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: PageView(
          controller: _pageController,
          onPageChanged: (index) {
            if (_currentIndex != index) {
              setState(() {
                _currentIndex = index;
              });
            }
          },
          // NeverScrollableScrollPhysics: prevents PageView from consuming
          // vertical drag gestures, allowing RefreshIndicator inside tabs to work
          physics: const NeverScrollableScrollPhysics(),
          children: const [
            HomeTabView(),
            SignalsListView(),
            AiInsightsScreen(),
            NotificationCenterScreen(),
            ProfileScreen(),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppTheme.secondaryBackground.withValues(alpha: 0.95),
          border: const Border(
            top: BorderSide(color: AppTheme.surfaceHighlight, width: 1.2),
          ),
        ),
        child: SafeArea(
          top: false,
          child: CustomBottomNavigation(
            pageController: _pageController,
            selectedIndex: _currentIndex,
            onItemSelected: _onTabChanged,
            activeColor: AppTheme.primary,
            inactiveColor: AppTheme.textSecondary,
            items: const [
              NavigationItem(
                filledIcon: Icons.home_filled,
                outlinedIcon: Icons.home_outlined,
                label: 'Home',
              ),
              NavigationItem(
                filledIcon: Icons.radar,
                outlinedIcon: Icons.radar_outlined,
                label: 'Live',
              ),
              NavigationItem(
                filledIcon: Icons.insights,
                outlinedIcon: Icons.insights_outlined,
                label: 'Market',
              ),
              NavigationItem(
                filledIcon: Icons.notifications_rounded,
                outlinedIcon: Icons.notifications_none_rounded,
                label: 'Alerts',
              ),
              NavigationItem(
                filledIcon: Icons.person,
                outlinedIcon: Icons.person_outline,
                label: 'Profile',
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// 🤖 HOLOGRAPHIC AI COPILOT SHEET
class AiCopilotSheet extends StatefulWidget {
  const AiCopilotSheet({super.key});

  @override
  State<AiCopilotSheet> createState() => _AiCopilotSheetState();
}

class _AiCopilotSheetState extends State<AiCopilotSheet> {
  final TextEditingController _controller = TextEditingController();
  final List<Map<String, String>> _messages = [
    {'sender': 'ai', 'text': 'Holographic uplink active. Query terminal on today\'s NIFTY support levels or whale block transfers.'}
  ];

  void _sendMessage() {
    if (_controller.text.trim().isEmpty) return;
    final text = _controller.text.trim();
    setState(() {
      _messages.add({'sender': 'user', 'text': text});
    });
    _controller.clear();

    Future.delayed(const Duration(milliseconds: 700), () {
      if (!mounted) return;
      String response = "Order book scanners confirm bullish consolidation. High concentration of buy limits at 51300 BANKNIFTY.";
      if (text.toLowerCase().contains('nifty')) {
        response = "NIFTY Spot Index is trading in a narrow range. Scanners recommend waiting for breakout above 23620.";
      } else if (text.toLowerCase().contains('whale') || text.toLowerCase().contains('money')) {
        response = "Smart money activity logs show net +₹2,480 Cr block buying from institutional nodes today.";
      }
      setState(() {
        _messages.add({'sender': 'ai', 'text': response});
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.6,
      decoration: BoxDecoration(
        color: AppTheme.secondaryBackground,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        border: Border.all(color: AppTheme.primary.withValues(alpha: 0.2)),
      ),
      padding: EdgeInsets.only(
        top: 16,
        left: 16,
        right: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(color: AppTheme.success, shape: BoxShape.circle),
                  ),
                  const SizedBox(width: 8),
                  const Text('LVX AI COPILOT', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.0)),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.close, color: AppTheme.textSecondary, size: 18),
                onPressed: () => Navigator.pop(context),
              )
            ],
          ),
          const Divider(color: AppTheme.surfaceHighlight),
          Expanded(
            child: ListView.builder(
              itemCount: _messages.length,
              itemBuilder: (context, idx) {
                final msg = _messages[idx];
                final isUser = msg['sender'] == 'user';
                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isUser ? AppTheme.primary.withValues(alpha: 0.1) : AppTheme.surfaceHighlight.withValues(alpha: 0.4),
                      border: Border.all(
                        color: isUser ? AppTheme.primary.withValues(alpha: 0.2) : AppTheme.surfaceHighlight.withValues(alpha: 0.6),
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(
                      msg['text']!,
                      style: TextStyle(color: isUser ? AppTheme.primary : Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ),
                );
              },
            ),
          ),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _controller,
                  style: const TextStyle(fontSize: 13, color: Colors.white),
                  decoration: InputDecoration(
                    hintText: 'Ask copilot...',
                    hintStyle: const TextStyle(color: AppTheme.textSecondary),
                    filled: true,
                    fillColor: Colors.black,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                  ),
                  onSubmitted: (_) => _sendMessage(),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                icon: const Icon(Icons.send_rounded, color: AppTheme.primary),
                onPressed: _sendMessage,
              )
            ],
          )
        ],
      ),
    );
  }
}

/// HOME DASHBOARD SUB-VIEW
class HomeTabView extends ConsumerStatefulWidget {
  const HomeTabView({super.key});

  @override
  ConsumerState<HomeTabView> createState() => _HomeTabViewState();
}

class _HomeTabViewState extends ConsumerState<HomeTabView> {
  final GlobalKey<RefreshIndicatorState> _refreshKey = GlobalKey<RefreshIndicatorState>();

  Future<void> _onRefresh() async {
    final baseUrl = ref.read(backendUrlProvider);
    final prefs = await SharedPreferences.getInstance();
    final String? token = prefs.getString('auth_token');

    await ref.read(socketServiceProvider).fetchHomeContent(baseUrl);
    await ref.read(socketServiceProvider).fetchInitialSignals(baseUrl);
    await ref.read(socketServiceProvider).fetchAiSentiment(baseUrl);
    if (token != null) {
      await ref.read(socketServiceProvider).fetchUserProfile(baseUrl, token);
    }
  }

  @override
  Widget build(BuildContext context) {
    final priceInfo = ref.watch(livePriceInfoProvider);
    final niftyData = priceInfo['NIFTY 50'] ?? {'price': '₹24,235.00', 'change': '+0.00%', 'isUp': true};
    final bankNiftyData = priceInfo['BANKNIFTY'] ?? {'price': '₹51,820.00', 'change': '+0.00%', 'isUp': true};
    
    final String userTier = ref.watch(userTierProvider);
    final bool isElite = userTier == 'pro';

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Row(
          children: [
            const LvxLogo(size: 28),
            const SizedBox(width: 8),
            RichText(
              text: const TextSpan(
                style: TextStyle(
                  fontFamily: 'Outfit',
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.5,
                ),
                children: [
                  TextSpan(text: 'LV', style: TextStyle(color: Colors.white)),
                  TextSpan(text: 'X', style: TextStyle(color: AppTheme.primary)),
                ],
              ),
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: AppTheme.success,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                const Text(
                  'MARKET OPEN',
                  style: TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        key: _refreshKey,
        color: AppTheme.primary,
        backgroundColor: AppTheme.secondaryBackground,
        displacement: 60,
        onRefresh: _onRefresh,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // INDEX TICKERS ROW
              Row(
                children: [
                  Expanded(
                    child: _buildIndexCard(
                      title: 'NIFTY',
                      price: niftyData['price'] as String? ?? '₹24,235.00',
                      change: niftyData['change'] as String? ?? '+0.00%',
                      isUp: niftyData['isUp'] as bool? ?? true,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildIndexCard(
                      title: 'BANKNIFTY',
                      price: bankNiftyData['price'] as String? ?? '₹51,820.00',
                      change: bankNiftyData['change'] as String? ?? '+0.00%',
                      isUp: bankNiftyData['isUp'] as bool? ?? true,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
  
              // CONDITIONAL VIEW BASED ON TIER
              if (!isElite) ...[
                _buildPremiumAccessCard(context),
              ] else ...[
                _buildAiGuidanceCard(),
                const SizedBox(height: 24),
                _buildLastSignalResultCard(),
              ],
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildIndexCard({
    required String title,
    required String price,
    required String change,
    required bool isUp,
  }) {
    final Color color = isUp ? AppTheme.success : AppTheme.error;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: AppTheme.secondaryBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: color.withValues(alpha: 0.15),
          width: 1.2,
        ),
      ),
      child: Row(
        children: [
          Icon(
            isUp ? Icons.trending_up_rounded : Icons.trending_down_rounded,
            color: color,
            size: 18,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textSecondary,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 4),
                Wrap(
                  crossAxisAlignment: WrapCrossAlignment.center,
                  spacing: 6,
                  children: [
                    Text(
                      price,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      change,
                      style: TextStyle(
                        color: color,
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPremiumAccessCard(BuildContext context) {
    return Container(
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.workspace_premium_rounded, color: AppTheme.primary, size: 20),
              const SizedBox(width: 8),
              const Text(
                'PREMIUM ACCESS',
                style: TextStyle(
                  color: AppTheme.primary,
                  fontSize: 10,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Text(
            'Most traders enter after the move is already gone.',
            style: TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.bold,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Get real-time signals, full entries, and AI guidance before the crowd.',
            style: TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 12,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 24),
          _buildPremiumFeatureRow(Icons.flash_on_rounded, 'Real-time signal entries'),
          _buildPremiumFeatureRow(Icons.adjust_rounded, 'Full targets & stop loss levels'),
          _buildPremiumFeatureRow(Icons.notifications_none_rounded, 'Instant push alerts'),
          _buildPremiumFeatureRow(Icons.lock_outline_rounded, 'VIP Telegram access'),
          const SizedBox(height: 28),
          GestureDetector(
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const SubscriptionPlansScreen()),
              );
            },
            child: Container(
              width: double.infinity,
              height: 52,
              decoration: BoxDecoration(
                color: AppTheme.primary,
                borderRadius: BorderRadius.circular(26), // Fully rounded
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primary.withValues(alpha: 0.25),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  )
                ],
              ),
              alignment: Alignment.center,
              child: const Text(
                'Unlock Pro Access',
                style: TextStyle(
                  color: Colors.black,
                  fontSize: 14,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 0.5,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPremiumFeatureRow(IconData icon, String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppTheme.primary.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: AppTheme.primary, size: 18),
          ),
          const SizedBox(width: 14),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAiGuidanceCard() {
    final homeContent = ref.watch(homeContentProvider);
    final List<dynamic> guidanceList = homeContent?['guidance'] ?? [
      'Wait for the entry zone',
      'Do not chase price after breakout',
      'Always respect stop loss',
    ];

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
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.primary.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.psychology_rounded, color: AppTheme.primary, size: 20),
              ),
              const SizedBox(width: 12),
              const Text(
                'AI Guidance',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          ...guidanceList.asMap().entries.map((entry) {
            final idx = entry.key;
            final text = entry.value.toString();
            return Padding(
              padding: EdgeInsets.only(bottom: idx == guidanceList.length - 1 ? 0 : 12.0),
              child: _buildGuidanceBullet(text),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildGuidanceBullet(String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '→ ',
          style: TextStyle(
            color: AppTheme.primary,
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(width: 4),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 12,
              height: 1.4,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildLastSignalResultCard() {
    final allSignals = ref.watch(signalsListProvider);
    final closedSignals = allSignals.where((s) => s.isClosed).toList();
    
    String signalName = 'NIFTY 24200 CE';
    String changeStr = '+78%';
    String durationStr = 'in 6 minutes';
    bool isProfit = true;
    
    if (closedSignals.isNotEmpty) {
      final lastSignal = closedSignals.first;
      signalName = '${lastSignal.symbol} ${lastSignal.strike}';
      
      if (lastSignal.entry > 0) {
        final change = ((lastSignal.exitPrice ?? lastSignal.entry) - lastSignal.entry) / lastSignal.entry * 100;
        changeStr = '${change >= 0 ? "+" : ""}${change.toStringAsFixed(1)}%';
      }
      durationStr = lastSignal.time;
      if (durationStr == 'Live Now') durationStr = 'Completed';
      isProfit = lastSignal.isProfit;
    } else {
      final homeContent = ref.watch(homeContentProvider);
      if (homeContent != null && homeContent['lastSignal'] != null) {
        signalName = 'Recent Completed Setup';
        changeStr = '+78%';
        durationStr = homeContent['lastSignal'].toString();
      }
    }

    final cardBgColor = isProfit ? const Color(0xFF0C1912) : const Color(0xFF190C0C);
    final cardBorderColor = isProfit ? const Color(0xFF1B3D2B) : const Color(0xFF3D1B1B);
    final textColor = isProfit ? AppTheme.success : AppTheme.error;

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
              Icon(
                isProfit ? Icons.trending_up_rounded : Icons.trending_down_rounded, 
                color: textColor, 
                size: 20
              ),
              const SizedBox(width: 12),
              const Text(
                'Last Signal Result',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16.0),
            decoration: BoxDecoration(
              color: cardBgColor, // Dark greenish or reddish background
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: cardBorderColor),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  signalName,
                  style: const TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  changeStr,
                  style: TextStyle(
                    color: textColor,
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  durationStr,
                  style: TextStyle(
                    color: AppTheme.textSecondary.withValues(alpha: 0.6),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
