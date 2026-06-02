import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/theme.dart';
import '../../core/design_system.dart';
import '../../core/socket_service.dart';
import '../../shared/navigation/custom_bottom_navigation.dart';
import '../../shared/navigation/navigation_item.dart';
import '../signals/signals_list_view.dart';
import '../signals/signal_detail_view.dart';
import '../ai_insights/ai_insights_screen.dart';
import '../profile/profile_screen.dart';
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

/// 🤖 PREMIUM AI ACTIVITY CARD
class AiActivityCard extends ConsumerStatefulWidget {
  const AiActivityCard({super.key});

  @override
  ConsumerState<AiActivityCard> createState() => _AiActivityCardState();
}

class _AiActivityCardState extends ConsumerState<AiActivityCard> with TickerProviderStateMixin {
  String _aiStatus = 'scanning'; // 'scanning' or 'found'
  late AnimationController _pulseController;
  late AnimationController _shimmerController;
  String? _lastSignalId;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _shimmerController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _shimmerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Listen to signals list to detect new signals
    ref.listen<List<SignalData>>(signalsListProvider, (previous, next) {
      if (next.isNotEmpty) {
        final latestId = next.first.id;
        if (_lastSignalId != null && latestId != _lastSignalId) {
          // New signal detected!
          setState(() {
            _aiStatus = 'found';
          });
          Future.delayed(const Duration(seconds: 8), () {
            if (mounted) {
              setState(() {
                _aiStatus = 'scanning';
              });
            }
          });
        }
        _lastSignalId = latestId;
      }
    });

    // Initialize _lastSignalId on first build
    if (_lastSignalId == null && ref.read(signalsListProvider).isNotEmpty) {
      _lastSignalId = ref.read(signalsListProvider).first.id;
    }

    final bool isFound = _aiStatus == 'found';
    final Color activeColor = isFound ? AppTheme.success : AppTheme.primary;
    final Color borderColor = isFound ? AppTheme.success.withValues(alpha: 0.3) : Colors.white.withValues(alpha: 0.05);
    final Color bgColor = isFound ? AppTheme.success.withValues(alpha: 0.05) : AppTheme.secondaryBackground;

    Widget iconGlow = AnimatedBuilder(
      animation: _pulseController,
      builder: (context, child) {
        double scale = 1.0 + (_pulseController.value * 0.25);
        double opacity = 0.4 - (_pulseController.value * 0.3);
        return Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: activeColor.withValues(alpha: opacity),
          ),
          transform: Matrix4.identity()..scale(scale),
          transformAlignment: Alignment.center,
        );
      },
    );

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: borderColor, width: 1.2),
        boxShadow: isFound
            ? [
                BoxShadow(
                  color: AppTheme.success.withValues(alpha: 0.1),
                  blurRadius: 20,
                  spreadRadius: 1,
                )
              ]
            : null,
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          // Moving Shimmer Effect
          Positioned.fill(
            child: AnimatedBuilder(
              animation: _shimmerController,
              builder: (context, child) {
                return Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment(-2.0 + (_shimmerController.value * 4), -1.0),
                      end: Alignment(-1.0 + (_shimmerController.value * 4), 1.0),
                      colors: [
                        Colors.transparent,
                        Colors.white.withValues(alpha: 0.01),
                        Colors.white.withValues(alpha: 0.03),
                        Colors.white.withValues(alpha: 0.01),
                        Colors.transparent,
                      ],
                      stops: const [0.0, 0.45, 0.5, 0.55, 1.0],
                    ),
                  ),
                );
              },
            ),
          ),
          
          // Content Row
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            child: Row(
              children: [
                // Glowing Icon
                Stack(
                  alignment: Alignment.center,
                  children: [
                    iconGlow,
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.black.withValues(alpha: 0.4),
                        border: Border.all(
                          color: activeColor.withValues(alpha: 0.2),
                          width: 1.2,
                        ),
                      ),
                      child: Icon(
                        isFound ? Icons.bolt_rounded : Icons.psychology_rounded,
                        color: activeColor,
                        size: 20,
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 16),
                
                // Status Text
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        isFound ? '⚡ SETUP FOUND' : '🤖 AI ANALYZING MARKET',
                        style: TextStyle(
                          color: isFound ? AppTheme.success : Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.0,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        isFound
                            ? 'New trading setup broadcasted to all terminal nodes.'
                            : 'Scanning options order book and smart money flow...',
                        style: const TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 10,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
                
                // Next Signal Tag
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.4),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Pulsing tiny dot
                      AnimatedBuilder(
                        animation: _pulseController,
                        builder: (context, child) {
                          double opacity = 0.5 + (_pulseController.value * 0.5);
                          return Container(
                            width: 6,
                            height: 6,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: activeColor.withValues(alpha: opacity),
                            ),
                          );
                        },
                      ),
                      const SizedBox(width: 6),
                      Text(
                        isFound ? 'ACTIVE' : 'NEXT ANYTIME',
                        style: const TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 8,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
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

    final allSignals = ref.watch(signalsListProvider);
    final telegramSignals = allSignals.where((s) => s.source.toUpperCase() != 'ALGO' && s.source.toUpperCase() != 'SYSTEM').toList();

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

              // AI ACTIVITY CARD
              const AiActivityCard(),
              const SizedBox(height: 24),

              // TELEGRAM SIGNALS SECTION
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'TELEGRAM INTELLIGENCE',
                    style: TextStyle(
                      fontFamily: 'Outfit',
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.5,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0088cc).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFF0088cc).withValues(alpha: 0.2), width: 1.2),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.send_rounded, color: Color(0xFF0088cc), size: 10),
                        const SizedBox(width: 4),
                        const Text(
                          'LIVE CHANNEL',
                          style: TextStyle(
                            color: Color(0xFF0088cc),
                            fontSize: 8,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              if (telegramSignals.isEmpty) ...[
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: AppTheme.secondaryBackground,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.send_rounded,
                        color: const Color(0xFF0088cc).withValues(alpha: 0.3),
                        size: 32,
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Scanning priority Telegram channels...',
                        style: TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ] else ...[
                ...telegramSignals.take(3).map((signal) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12.0),
                    child: GestureDetector(
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => SignalDetailView(signal: signal)),
                        );
                      },
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppTheme.secondaryBackground,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: signal.isClosed
                                ? Colors.white.withValues(alpha: 0.05)
                                : AppTheme.primary.withValues(alpha: 0.15),
                            width: 1.2,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Text(
                                      signal.symbol,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w900,
                                        fontSize: 14,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: (signal.strike.contains('CE') ? AppTheme.success : AppTheme.error).withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        signal.strike,
                                        style: TextStyle(
                                          color: signal.strike.contains('CE') ? AppTheme.success : AppTheme.error,
                                          fontSize: 9,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                Text(
                                  signal.isClosed 
                                      ? (signal.isProfit ? 'PROFIT' : 'SL HIT')
                                      : 'ACTIVE',
                                  style: TextStyle(
                                    color: signal.isClosed
                                        ? (signal.isProfit ? AppTheme.success : AppTheme.error)
                                        : AppTheme.primary,
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ],
                            ),
                            const Divider(color: AppTheme.surfaceHighlight, height: 20),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                _buildCompactMetric('ENTRY', '₹${signal.entry.toStringAsFixed(1)}'),
                                _buildCompactMetric('TARGET', '₹${signal.target.toStringAsFixed(1)}'),
                                _buildCompactMetric('SL', '₹${signal.stopLoss.toStringAsFixed(1)}', isSL: true),
                                _buildCompactMetric('CONFIDENCE', '${signal.confidence}%', isConfidence: true),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCompactMetric(String label, String value, {bool isSL = false, bool isConfidence = false}) {
    Color valColor = Colors.white;
    if (isSL) valColor = AppTheme.error;
    if (isConfidence) valColor = AppTheme.primary;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: AppTheme.textSecondary,
            fontSize: 8,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            color: valColor,
            fontSize: 11,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
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


}
