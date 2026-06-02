import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../core/design_system.dart';
import '../../core/socket_service.dart';
import 'signal_detail_view.dart';

class SignalsListView extends ConsumerStatefulWidget {
  const SignalsListView({super.key});

  @override
  ConsumerState<SignalsListView> createState() => _SignalsListViewState();
}

class _SignalsListViewState extends ConsumerState<SignalsListView> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Read live signals from Riverpod provider
    final allSignals = ref.watch(signalsListProvider);
    final String userTier = ref.watch(userTierProvider);
    final bool isPro = userTier == 'pro';
    
    final activeSignals = allSignals.where((s) => !s.isClosed).toList();
    final historySignals = allSignals.where((s) => s.isClosed).toList();

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'Live Signals',
          style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold, fontSize: 20),
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppTheme.primary,
          labelColor: Colors.white,
          unselectedLabelColor: AppTheme.textSecondary,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 0.5),
          tabs: const [
            Tab(text: 'ACTIVE ALERTS'),
            Tab(text: 'PAST SIGNALS'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildSignalsList(activeSignals, isPro),
          _buildSignalsList(historySignals, isPro),
        ],
      ),
    );
  }

  Widget _buildSignalsList(List<SignalData> list, bool isPro) {
    if (list.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.radar_outlined, color: AppTheme.textSecondary.withValues(alpha: 0.3), size: 48),
            const SizedBox(height: 16),
            const Text(
              'No signals found',
              style: TextStyle(color: AppTheme.textSecondary, fontSize: 14, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16.0),
      itemCount: list.length,
      itemBuilder: (context, index) {
        final signal = list[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 16.0),
          child: GestureDetector(
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => SignalDetailView(signal: signal)),
              );
            },
            child: GlassCard(
              hasGlow: !signal.isClosed,
              glowColor: signal.symbol == 'NIFTY' ? AppTheme.primary : AppTheme.secondary,
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Signal Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Text(
                            signal.symbol,
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 15),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: (signal.isClosed 
                                      ? (signal.isProfit ? AppTheme.success : AppTheme.error)
                                      : (signal.strike.contains('CE') ? AppTheme.success : AppTheme.error))
                                  .withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              signal.strike,
                              style: TextStyle(
                                color: signal.isClosed 
                                    ? (signal.isProfit ? AppTheme.success : AppTheme.error)
                                    : (signal.strike.contains('CE') ? AppTheme.success : AppTheme.error),
                                fontSize: 10, 
                                fontWeight: FontWeight.bold
                              ),
                            ),
                          ),
                        ],
                      ),
                      Text(
                        signal.time,
                        style: const TextStyle(color: AppTheme.textSecondary, fontSize: 10),
                      ),
                    ],
                  ),
                  const Divider(color: AppTheme.surfaceHighlight, height: 24),
                  
                  // Targets row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _SignalMetric(
                        label: 'ENTRY', 
                        value: (isPro || signal.isClosed) ? '₹${signal.entry.toStringAsFixed(1)}' : '₹••••',
                      ),
                      _SignalMetric(
                        label: signal.isClosed ? 'EXIT PRICE' : 'TARGET', 
                        value: (isPro || signal.isClosed)
                            ? '₹${(signal.isClosed ? (signal.exitPrice ?? signal.entry) : signal.target).toStringAsFixed(1)}'
                            : '₹••••',
                        isAccent: !signal.isClosed || signal.isProfit,
                        isDanger: signal.isClosed && !signal.isProfit,
                      ),
                      _SignalMetric(
                        label: 'CONFIDENCE', 
                        value: '${signal.confidence}%',
                        isPrimary: true,
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Summary reason
                  Text(
                    (isPro || signal.isClosed) ? signal.reasoning : 'Upgrade to Pro to unlock AI reasoning and entry targets in real-time.',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: (isPro || signal.isClosed) ? AppTheme.textSecondary : AppTheme.primary.withValues(alpha: 0.7),
                      fontSize: 11,
                      height: 1.4,
                      fontStyle: (isPro || signal.isClosed) ? FontStyle.normal : FontStyle.italic,
                    ),
                  ),
                  
                  const SizedBox(height: 12),
                  // Footer status info
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppTheme.surfaceHighlight.withValues(alpha: 0.5),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          signal.riskLevel,
                          style: const TextStyle(color: AppTheme.textSecondary, fontSize: 9, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const Row(
                        children: [
                          Text(
                            'Analysis Details',
                            style: TextStyle(color: AppTheme.primary, fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                          Icon(Icons.arrow_forward_ios_rounded, color: AppTheme.primary, size: 10),
                        ],
                      )
                    ],
                  )
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _SignalMetric extends StatelessWidget {
  final String label;
  final String value;
  final bool isAccent;
  final bool isDanger;
  final bool isPrimary;

  const _SignalMetric({
    required this.label,
    required this.value,
    this.isAccent = false,
    this.isDanger = false,
    this.isPrimary = false,
  });

  @override
  Widget build(BuildContext context) {
    Color valColor = Colors.white;
    if (isAccent) valColor = AppTheme.success;
    if (isDanger) valColor = AppTheme.error;
    if (isPrimary) valColor = AppTheme.primary;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: AppTheme.textSecondary, letterSpacing: 0.5),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(color: valColor, fontSize: 14, fontWeight: FontWeight.bold),
        )
      ],
    );
  }
}

class SignalData {
  final String id;
  final String symbol;
  final String strike;
  final String type;
  final double entry;
  final double target;
  final double stopLoss;
  final int confidence;
  final String riskLevel;
  final String time;
  final String reasoning;
  final bool isClosed;
  final bool isProfit;
  final double? exitPrice;
  final String source;

  SignalData({
    required this.id,
    required this.symbol,
    required this.strike,
    required this.type,
    required this.entry,
    required this.target,
    required this.stopLoss,
    required this.confidence,
    required this.riskLevel,
    required this.time,
    required this.reasoning,
    this.isClosed = false,
    this.isProfit = false,
    this.exitPrice,
    this.source = 'TELEGRAM',
  });
}
