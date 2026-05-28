import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../core/design_system.dart';
import '../../core/socket_service.dart';
import 'signals_list_view.dart';
import '../profile/broker_connect_screen.dart';
import '../profile/subscription_plans_screen.dart';

class SignalDetailView extends ConsumerWidget {
  final SignalData signal;

  const SignalDetailView({super.key, required this.signal});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final String userTier = ref.watch(userTierProvider);
    final bool isPro = userTier == 'pro';
    final bool canShowDetails = isPro || signal.isClosed;

    final entryDisplay = canShowDetails ? '₹${signal.entry.toStringAsFixed(1)}' : '₹••••';
    final targetDisplay = canShowDetails ? '₹${(signal.isClosed ? signal.exitPrice! : signal.target).toStringAsFixed(1)}' : '₹••••';
    final slDisplay = canShowDetails ? '₹${signal.stopLoss.toStringAsFixed(1)}' : '₹••••';

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          '${signal.symbol} ${signal.strike}',
          style: const TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Confidence Indicator & Status
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: signal.isClosed
                            ? (signal.isProfit ? AppTheme.success : AppTheme.error).withValues(alpha: 0.1)
                            : AppTheme.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        signal.isClosed 
                            ? (signal.isProfit ? 'CLOSED - PROFIT' : 'CLOSED - STOP LOSS') 
                            : 'ACTIVE MONITORING',
                        style: TextStyle(
                          color: signal.isClosed
                              ? (signal.isProfit ? AppTheme.success : AppTheme.error)
                              : AppTheme.primary,
                          fontSize: 9,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.0,
                        ),
                      ),
                    ),
                  ],
                ),
                Text(
                  '${signal.confidence}% Confidence Rating',
                  style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 12),
                )
              ],
            ),
            const SizedBox(height: 20),

            // Main Target / SL Pricing Panel
            GlassCard(
              hasGlow: !signal.isClosed,
              glowColor: AppTheme.primary,
              padding: const EdgeInsets.all(24.0),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildPriceBlock('STOP LOSS', slDisplay, color: AppTheme.error),
                      _buildPriceBlock('ENTRY POINT', entryDisplay),
                      _buildPriceBlock(
                        signal.isClosed ? 'EXIT PRICE' : 'TARGET PRICE', 
                        targetDisplay, 
                        color: signal.isClosed && !signal.isProfit ? AppTheme.error : AppTheme.success
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  
                  // Visual Target Progress Timeline
                  _buildProgressTimeline(canShowDetails),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // AI Core Logic Card
            const Text(
              'AI Market Intelligence & Setup Core',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 0.5),
            ),
            const SizedBox(height: 12),
            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.psychology_outlined, color: AppTheme.primary, size: 24),
                      const SizedBox(width: 8),
                      const Text(
                        'ORDER FLOW ANALYSIS',
                        style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 13, letterSpacing: 0.5),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    canShowDetails ? signal.reasoning : 'Upgrade to Pro to unlock institutional order flow analysis and live target levels.',
                    style: TextStyle(
                      color: canShowDetails ? AppTheme.textSecondary : AppTheme.primary.withValues(alpha: 0.7), 
                      fontSize: 13, 
                      height: 1.5,
                      fontStyle: canShowDetails ? FontStyle.normal : FontStyle.italic,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Divider(color: AppTheme.surfaceHighlight),
                  const SizedBox(height: 8),
                  _InfoRow(label: 'Trend Strength Bias', value: canShowDetails ? 'BULLISH VOL EXPANSION' : '••••••••'),
                  _InfoRow(label: 'Institutional Delta imbalance', value: canShowDetails ? '+420,000 contracts (Net Buy)' : '••••••••'),
                  _InfoRow(label: 'VIX Volatility level', value: canShowDetails ? '12.86 (Calming Structure)' : '••••••••'),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Risk Profile Card
            GlassCard(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.warning.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.shield_outlined, color: AppTheme.warning, size: 24),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'RISK PROFILE: ${signal.riskLevel.toUpperCase()}',
                          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 12, letterSpacing: 0.5),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Risk managed with automated stop loss. Adjust your position sizes to limit maximum risk to 1.5% of total capital.',
                          style: TextStyle(color: AppTheme.textSecondary, fontSize: 11, height: 1.4),
                        ),
                      ],
                    ),
                  )
                ],
              ),
            ),
            
            const SizedBox(height: 32),
            
            // Execute trade via Broker Connect Simulator
            if (!signal.isClosed)
              PremiumButton(
                text: canShowDetails ? 'EXECUTE TRADE VIA BROKER' : 'UNLOCK PRO TO TRADE',
                icon: Icons.flash_on_rounded,
                onPressed: () {
                  if (canShowDetails) {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const BrokerConnectScreen()),
                    );
                  } else {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const SubscriptionPlansScreen()),
                    );
                  }
                },
              ),
            
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildPriceBlock(String label, String value, {Color? color}) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: AppTheme.textSecondary, letterSpacing: 0.8),
        ),
        const SizedBox(height: 6),
        Text(
          value,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: color ?? Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _buildProgressTimeline(bool canShowDetails) {
    double progressPercent = 0.5; // Neutral placement
    String progressText = "Option Buy Setup Triggered - Price holding entry";
    Color progressColor = AppTheme.primary;

    if (signal.isClosed) {
      if (signal.isProfit) {
        progressPercent = 1.0;
        progressText = "Targets completed! Target 2 hit.";
        progressColor = AppTheme.success;
      } else {
        progressPercent = 0.0;
        progressText = "Trade Closed: Stop Loss triggered.";
        progressColor = AppTheme.error;
      }
    }

    final slLabel = canShowDetails ? '${signal.stopLoss}' : '•••';
    final targetLabel = canShowDetails ? '${signal.target}' : '•••';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'SL: $slLabel',
              style: const TextStyle(fontSize: 9, color: AppTheme.textSecondary),
            ),
            const Text(
              'Entry',
              style: TextStyle(fontSize: 9, color: AppTheme.textSecondary),
            ),
            Text(
              'Target: $targetLabel',
              style: const TextStyle(fontSize: 9, color: AppTheme.textSecondary),
            ),
          ],
        ),
        const SizedBox(height: 8),
        // Linear Indicator bar
        Container(
          height: 8,
          decoration: BoxDecoration(
            color: AppTheme.surfaceHighlight,
            borderRadius: BorderRadius.circular(4),
          ),
          child: Stack(
            children: [
              FractionallySizedBox(
                widthFactor: progressPercent,
                child: Container(
                  decoration: BoxDecoration(
                    color: progressColor,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
              if (progressPercent > 0.0 && progressPercent < 1.0)
                Align(
                  alignment: Alignment(progressPercent * 2 - 1, 0),
                  child: Container(
                    width: 12,
                    height: 12,
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                  ),
                )
            ],
          ),
        ),
        const SizedBox(height: 10),
        Center(
          child: Text(
            canShowDetails ? progressText : 'Upgrade to Pro to track target achievement live',
            style: TextStyle(
              color: canShowDetails ? progressColor.withValues(alpha: 0.8) : AppTheme.primary,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
        )
      ],
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
          Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
        ],
      ),
    );
  }
}
