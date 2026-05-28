import 'dart:math' as math;
import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import 'theme.dart';

/// FROSTED GLASSMORPHIC CARD
class GlassCard extends StatelessWidget {
  final Widget child;
  final double borderRadius;
  final double blur;
  final Color? backgroundColor;
  final Color? borderColor;
  final EdgeInsetsGeometry padding;
  final bool hasGlow;
  final Color? glowColor;

  const GlassCard({
    super.key,
    required this.child,
    this.borderRadius = 20.0,
    this.blur = 20.0,
    this.backgroundColor,
    this.borderColor,
    this.padding = const EdgeInsets.all(16.0),
    this.hasGlow = false,
    this.glowColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(borderRadius),
        boxShadow: hasGlow
            ? [
                BoxShadow(
                  color: (glowColor ?? AppTheme.primary).withValues(alpha: 0.08),
                  blurRadius: 24,
                  spreadRadius: 2,
                )
              ]
            : null,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(borderRadius),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
          child: Container(
            padding: padding,
            decoration: BoxDecoration(
              color: backgroundColor ?? AppTheme.surface,
              borderRadius: BorderRadius.circular(borderRadius),
              border: Border.all(
                color: borderColor ?? AppTheme.surfaceHighlight.withValues(alpha: 0.5),
                width: 1.2,
              ),
            ),
            child: child,
          ),
        ),
      ),
    );
  }
}

/// PREMIUM ACTION BUTTON WITH GLOW & GRADIENTS
class PremiumButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isSecondary;
  final IconData? icon;
  final double height;
  final double? width;
  final bool isLoading;

  const PremiumButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isSecondary = false,
    this.icon,
    this.height = 56.0,
    this.width,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    final ButtonStyle style = ElevatedButton.styleFrom(
      backgroundColor: Colors.transparent,
      shadowColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16.0),
      ),
      padding: EdgeInsets.zero,
    );

    return Container(
      height: height,
      width: width ?? double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16.0),
        gradient: isSecondary
            ? null
            : const LinearGradient(
                colors: [AppTheme.primary, AppTheme.secondary],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
        border: isSecondary
            ? Border.all(color: AppTheme.surfaceHighlight, width: 1.5)
            : null,
        boxShadow: !isSecondary && !isLoading
            ? [
                BoxShadow(
                  color: AppTheme.primary.withValues(alpha: 0.25),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                )
              ]
            : null,
        color: isSecondary ? AppTheme.surface : null,
      ),
      child: ElevatedButton(
        style: style,
        onPressed: isLoading ? null : onPressed,
        child: Center(
          child: isLoading
              ? const SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                )
              : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (icon != null) ...[
                      Icon(icon, color: isSecondary ? AppTheme.textPrimary : Colors.black, size: 20),
                      const SizedBox(width: 8),
                    ],
                    Text(
                      text,
                      style: TextStyle(
                        color: isSecondary ? AppTheme.textPrimary : Colors.black,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}

/// REALTIME TREND SPARKLINE CHART
class SparklineChart extends StatelessWidget {
  final List<double> data;
  final bool isUp;
  final double height;
  final double width;

  const SparklineChart({
    super.key,
    required this.data,
    required this.isUp,
    this.height = 40.0,
    this.width = 100.0,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      width: width,
      child: CustomPaint(
        painter: _SparklinePainter(data: data, isUp: isUp),
      ),
    );
  }
}

class _SparklinePainter extends CustomPainter {
  final List<double> data;
  final bool isUp;

  _SparklinePainter({required this.data, required this.isUp});

  @override
  void paint(Canvas canvas, Size size) {
    if (data.isEmpty) return;

    final paintLine = Paint()
      ..color = isUp ? AppTheme.success : AppTheme.error
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0
      ..strokeCap = StrokeCap.round
      ..isAntiAlias = true;

    final double minVal = data.reduce((a, b) => a < b ? a : b);
    final double maxVal = data.reduce((a, b) => a > b ? a : b);
    final double range = maxVal - minVal == 0 ? 1.0 : maxVal - minVal;

    final double widthInterval = size.width / (data.length - 1);
    final path = Path();
    final fillPath = Path();

    for (int i = 0; i < data.length; i++) {
      final double x = i * widthInterval;
      final double y = size.height - ((data[i] - minVal) / range) * size.height;

      if (i == 0) {
        path.moveTo(x, y);
        fillPath.moveTo(x, size.height);
        fillPath.lineTo(x, y);
      } else {
        path.lineTo(x, y);
        fillPath.lineTo(x, y);
      }

      if (i == data.length - 1) {
        fillPath.lineTo(x, size.height);
        fillPath.close();
      }
    }

    // Paint background gradient under the sparkline
    final gradient = LinearGradient(
      colors: [
        (isUp ? AppTheme.success : AppTheme.error).withValues(alpha: 0.25),
        Colors.transparent,
      ],
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
    );

    final rect = Rect.fromLTWH(0, 0, size.width, size.height);
    final paintFill = Paint()
      ..shader = gradient.createShader(rect)
      ..style = PaintingStyle.fill;

    canvas.drawPath(fillPath, paintFill);
    canvas.drawPath(path, paintLine);
  }

  @override
  bool shouldRepaint(covariant _SparklinePainter oldDelegate) {
    return oldDelegate.data != data || oldDelegate.isUp != isUp;
  }
}

/// CIRCULAR AI MARKET MOOD GAUGE
class MarketMoodGauge extends StatelessWidget {
  final double value; // 0.0 (Extreme Bearish) to 1.0 (Extreme Bullish)
  final String label;

  const MarketMoodGauge({
    super.key,
    required this.value,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 180,
      width: 220,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CustomPaint(
            size: const Size(200, 150),
            painter: _GaugePainter(value: value),
          ),
          Positioned(
            bottom: 24,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '${(value * 100).toInt()}%',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 34,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  label,
                  style: const TextStyle(
                    color: AppTheme.primary,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.0,
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}

class _GaugePainter extends CustomPainter {
  final double value;

  _GaugePainter({required this.value});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height);
    final double radius = size.width / 2 - 12;

    // 1. Draw arc segments (Bearish -> Neutral -> Bullish)
    final rect = Rect.fromCircle(center: center, radius: radius);
    
    // Background arc (dark track)
    final trackPaint = Paint()
      ..color = AppTheme.surfaceHighlight.withValues(alpha: 0.8)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 14.0
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(rect, 3.14, 3.14, false, trackPaint);

    // Active sweep arc with a gradient
    final activePaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 14.0
      ..strokeCap = StrokeCap.round;

    final gradient = LinearGradient(
      colors: [AppTheme.error, AppTheme.warning, AppTheme.success],
      stops: const [0.0, 0.5, 1.0],
    );
    activePaint.shader = gradient.createShader(rect);

    // Sweep length based on current value (max angle is PI radians = 3.14159)
    final sweepAngle = value * 3.14159;
    canvas.drawArc(rect, 3.14159, sweepAngle, false, activePaint);

    // 2. Draw sweeping indicator needle
    final needlePaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    final needleLength = radius - 20;
    // Angle in radians (from left PI to right 2*PI)
    final needleAngle = math.pi + (value * math.pi);
    final needleTip = Offset(
      center.dx + needleLength * math.cos(needleAngle),
      center.dy + needleLength * math.sin(needleAngle),
    );

    // Needle pivot circle
    canvas.drawCircle(center, 8, needlePaint);
    
    // Needle line
    final needleLinePaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 3.0
      ..strokeCap = StrokeCap.round;
    canvas.drawLine(center, needleTip, needleLinePaint);
  }

  @override
  bool shouldRepaint(covariant _GaugePainter oldDelegate) {
    return oldDelegate.value != value;
  }
}

class LvxLogo extends StatelessWidget {
  final double size;
  final Color? color;

  const LvxLogo({super.key, this.size = 40, this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color ?? AppTheme.primary,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: (color ?? AppTheme.primary).withValues(alpha: 0.35),
            blurRadius: 8,
          ),
        ],
      ),
      alignment: Alignment.center,
      child: Text(
        'P',
        style: TextStyle(
          color: Colors.black,
          fontSize: size * 0.6,
          fontWeight: FontWeight.w900,
          fontFamily: 'Outfit',
        ),
      ),
    );
  }
}
