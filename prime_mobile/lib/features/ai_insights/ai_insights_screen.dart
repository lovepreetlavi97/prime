import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../core/socket_service.dart';

class AiInsightsScreen extends ConsumerWidget {
  const AiInsightsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final priceInfo = ref.watch(livePriceInfoProvider);
    final niftyData = priceInfo['NIFTY 50'] ?? {'price': '₹24,235.00', 'change': '+0.00%', 'isUp': true};
    final bankNiftyData = priceInfo['BANKNIFTY'] ?? {'price': '₹51,820.00', 'change': '+0.00%', 'isUp': true};

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          physics: const BouncingScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // HEADER WITH ICON
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: const BoxDecoration(
                      color: AppTheme.primary,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.bar_chart_rounded, 
                      color: Colors.black, 
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 16),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Market Intelligence',
                        style: TextStyle(
                          fontFamily: 'Outfit',
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Real-time Analysis',
                        style: TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  )
                ],
              ),
              const SizedBox(height: 32),

              // MARKET OVERVIEW
              const Text(
                'Market Overview',
                style: TextStyle(
                  fontSize: 16, 
                  fontWeight: FontWeight.bold, 
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: _buildMarketCard(
                      title: 'NIFTY',
                      price: niftyData['price'] as String? ?? '₹24,235.00',
                      change: niftyData['change'] as String? ?? '+0.00%',
                      isUp: niftyData['isUp'] as bool? ?? true,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildMarketCard(
                      title: 'BANKNIFTY',
                      price: bankNiftyData['price'] as String? ?? '₹51,820.00',
                      change: bankNiftyData['change'] as String? ?? '+0.00%',
                      isUp: bankNiftyData['isUp'] as bool? ?? true,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // OPTION CHAIN INTELLIGENCE
              const Text(
                'Option Chain Intelligence',
                style: TextStyle(
                  fontSize: 16, 
                  fontWeight: FontWeight.bold, 
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 16),
              _buildOptionChainCard(ref),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMarketCard({
    required String title,
    required String price,
    required String change,
    required bool isUp,
  }) {
    final Color color = isUp ? AppTheme.success : AppTheme.error;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.secondaryBackground,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: color.withValues(alpha: 0.15),
          width: 1.2,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                isUp ? Icons.trending_up_rounded : Icons.trending_down_rounded,
                color: color,
                size: 16,
              ),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  color: AppTheme.textSecondary,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            price,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            change,
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOptionChainCard(WidgetRef ref) {
    final aiSentiment = ref.watch(aiSentimentProvider);
    
    final double pcr = (aiSentiment?['pcrRatio'] as num?)?.toDouble() ?? 0.87;
    final int maxPain = (aiSentiment?['maxPain'] as num?)?.toInt() ?? 24200;
    final String expiryText = aiSentiment?['expiryText'] as String? ?? 'Expiry: Thursday';
    final String biasText = aiSentiment?['sentiment'] as String? ?? 'Bullish Bias';
    
    // Determine progress bar fill factor (clamped between 0.1 and 0.9)
    double progressPercent = (pcr - 0.5) / 1.0;
    if (progressPercent < 0.1) progressPercent = 0.1;
    if (progressPercent > 0.9) progressPercent = 0.9;

    return Container(
      padding: const EdgeInsets.all(24.0),
      decoration: BoxDecoration(
        color: AppTheme.secondaryBackground,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'PCR Ratio',
                style: TextStyle(
                  color: AppTheme.textSecondary,
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                pcr.toStringAsFixed(2),
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white.withValues(alpha: 0.95),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Progress bar representing the PCR ratio
          Container(
            height: 6,
            width: double.infinity,
            decoration: BoxDecoration(
              color: AppTheme.surfaceHighlight,
              borderRadius: BorderRadius.circular(3),
            ),
            child: FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: progressPercent,
              child: Container(
                decoration: BoxDecoration(
                  color: pcr >= 1.0 ? AppTheme.success : AppTheme.warning,
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
            ),
          ),
          const SizedBox(height: 10),
          Text(
            biasText,
            style: const TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          const Divider(color: AppTheme.surfaceHighlight, height: 1),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Max Pain',
                style: TextStyle(
                  color: AppTheme.textSecondary,
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                maxPain == 24200 ? '24,200' : maxPain.toString(),
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white.withValues(alpha: 0.95),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            expiryText,
            style: const TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
