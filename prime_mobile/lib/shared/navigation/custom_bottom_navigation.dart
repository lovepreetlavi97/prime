import 'package:flutter/material.dart';
import 'navigation_item.dart';

/// 🟢 DRAG-SWIPEABLE CUSTOM BOTTOM NAVIGATION WIDGET (WHATSAPP/TELEGRAM PREMIUM STYLE)
class CustomBottomNavigation extends StatefulWidget {
  final PageController pageController;
  final int selectedIndex;
  final ValueChanged<int> onItemSelected;
  final List<NavigationItem> items;
  final Color activeColor;
  final Color inactiveColor;

  const CustomBottomNavigation({
    super.key,
    required this.pageController,
    required this.selectedIndex,
    required this.onItemSelected,
    required this.items,
    required this.activeColor,
    required this.inactiveColor,
  });

  @override
  State<CustomBottomNavigation> createState() => _CustomBottomNavigationState();
}

class _CustomBottomNavigationState extends State<CustomBottomNavigation> {
  // Processes horizontal drag offsets on the bottom bar to update PageView in real-time
  void _handleDragUpdate(double localX, double totalWidth) {
    if (!widget.pageController.hasClients) return;

    final int itemCount = widget.items.length;
    // Map drag coordinate to fractional page position
    final double targetPage = ((localX / totalWidth) * itemCount - 0.5)
        .clamp(0.0, (itemCount - 1).toDouble());

    final position = widget.pageController.position;
    final double viewportWidth = position.viewportDimension;
    final double targetOffset = targetPage * viewportWidth;

    widget.pageController.jumpTo(
      targetOffset.clamp(0.0, position.maxScrollExtent),
    );
  }

  // Snaps to the closest tab/page when the drag gesture is released
  void _handleDragEnd() {
    if (!widget.pageController.hasClients) return;

    final int targetPage = widget.pageController.page!.round();
    widget.pageController.animateToPage(
      targetPage,
      duration: const Duration(milliseconds: 320),
      curve: Curves.easeOutCubic, // Butter-smooth spring-like decelerating settle
    );
    widget.onItemSelected(targetPage);
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final double width = constraints.maxWidth;
        final double tabWidth = width / widget.items.length;
        const double pillHeight = 48.0; // Prominent large capsule height
        const double restWidth = 84.0;  // Prominent large capsule width
        const double offset = (restWidth - pillHeight) / 2; // 18.0

        return GestureDetector(
          onHorizontalDragStart: (details) =>
              _handleDragUpdate(details.localPosition.dx, width),
          onHorizontalDragUpdate: (details) =>
              _handleDragUpdate(details.localPosition.dx, width),
          onHorizontalDragEnd: (details) => _handleDragEnd(),
          behavior: HitTestBehavior.opaque,
          child: AnimatedBuilder(
            animation: widget.pageController,
            builder: (context, child) {
              // Extract real-time sub-pixel page scrolling offset (0.0 to 4.0)
              final double page = widget.pageController.hasClients
                  ? (widget.pageController.page ?? widget.selectedIndex.toDouble())
                  : widget.selectedIndex.toDouble();

              final int page1 = page.floor();
              final int page2 = page.ceil();
              final double t = page - page1;

              final double startX = tabWidth * (page1 + 0.5);
              final double endX = tabWidth * (page2 + 0.5);

              // Gooey stretch-morph mapping for leading and trailing capsule edges
              final double rightX = startX +
                  (endX - startX) * Curves.easeOutCubic.transform(t);
              final double leftX = startX +
                  (endX - startX) * Curves.easeInCubic.transform(t);
              final double currentX = (leftX + rightX) / 2;

              // Compute dynamic capsule lift offset to match the icon's translation
              double capsuleLift = 0.0;
              for (int i = 0; i < widget.items.length; i++) {
                final double tabCenter = tabWidth * (i + 0.5);
                final double distance = (currentX - tabCenter).abs();
                final double activeProgress =
                    (1.0 - (distance / (tabWidth * 0.65)))
                        .clamp(0.0, 1.0);
                capsuleLift += activeProgress * -5.0; // selected tab lifts by 5px
              }

              return Container(
                height: 80, // Premium spacious height
                color: Colors.transparent,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Synchronized sliding active capsule backdrop with dynamic vertical lifting
                    Positioned.fill(
                      child: RepaintBoundary(
                        child: CustomPaint(
                          painter: CapsuleIndicatorPainter(
                            leftX: leftX - offset,
                            rightX: rightX + offset,
                            pillHeight: pillHeight,
                            color: widget.activeColor,
                            centerY: 32.0 + capsuleLift, // Dynamically shifts centerY
                          ),
                        ),
                      ),
                    ),

                    // Tab Items Row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: List.generate(widget.items.length, (index) {
                        final item = widget.items[index];

                        final double tabCenter = tabWidth * (index + 0.5);
                        final double distance = (currentX - tabCenter).abs();

                        // Compute progress (1.0 when pill center aligns, fading out rapidly as it slides away)
                        final double activeProgress =
                            (1.0 - (distance / (tabWidth * 0.65)))
                                .clamp(0.0, 1.0);

                        final double lift = activeProgress * -5.0; // Selected tab lifts by 5px
                        final double scale = 1.0 + (activeProgress * 0.12); // Scales up by 12%
                        final Color itemColor = Color.lerp(
                          widget.inactiveColor,
                          widget.activeColor,
                          activeProgress,
                        )!;

                        return GestureDetector(
                          onTap: () => widget.onItemSelected(index),
                          behavior: HitTestBehavior.opaque,
                          child: SizedBox(
                            width: tabWidth,
                            height: 80, // Matches parent height
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const SizedBox(height: 12),
                                Expanded(
                                  child: Center(
                                    child: Transform.translate(
                                      offset: Offset(0, lift), // Lift is applied ONLY to the icon
                                      child: Transform.scale(
                                        scale: scale,
                                        child: Stack(
                                          alignment: Alignment.center,
                                          children: [
                                            // Outlined icon (fades out as active)
                                            Opacity(
                                              opacity:
                                                  (1.0 - activeProgress).clamp(0.0, 1.0),
                                              child: Icon(
                                                item.outlinedIcon,
                                                color: widget.inactiveColor,
                                                size: 22,
                                              ),
                                            ),
                                            // Filled icon (fades in as active)
                                            Opacity(
                                              opacity: activeProgress.clamp(0.0, 1.0),
                                              child: Icon(
                                                item.filledIcon,
                                                color: widget.activeColor,
                                                size: 22,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 6),
                                // Label text remains outside the translate offset to ensure a stable horizontal baseline
                                Text(
                                  item.label,
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: activeProgress > 0.5
                                        ? FontWeight.bold
                                        : FontWeight.normal,
                                    color: itemColor,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                                const SizedBox(height: 10),
                              ],
                            ),
                          ),
                        );
                      }),
                    ),
                  ],
                ),
              );
            },
          ),
        );
      },
    );
  }
}

/// 🫧 SLEEK CAPSULE INDICATOR PAINTER
class CapsuleIndicatorPainter extends CustomPainter {
  final double leftX;
  final double rightX;
  final double pillHeight;
  final Color color;
  final double centerY;

  CapsuleIndicatorPainter({
    required this.leftX,
    required this.rightX,
    required this.pillHeight,
    required this.color,
    required this.centerY,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final Rect rect = Rect.fromLTRB(
      leftX,
      centerY - (pillHeight / 2),
      rightX,
      centerY + (pillHeight / 2),
    );

    final RRect rrect = RRect.fromRectAndRadius(
      rect,
      Radius.circular(pillHeight / 2),
    );

    final Path path = Path()..addRRect(rrect);

    // Draw soft shadow to create a visual "floating" depth effect
    canvas.drawShadow(
      path,
      Colors.black.withValues(alpha: 0.45),
      4.0, // elevation
      true, // transparentOccluder
    );

    // Translucent glassmorphic frosted background fill
    final Paint fillPaint = Paint()
      ..shader = LinearGradient(
        colors: [
          color.withValues(alpha: 0.18),
          color.withValues(alpha: 0.05),
        ],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ).createShader(rect)
      ..style = PaintingStyle.fill
      ..isAntiAlias = true;

    // Glowing outline border stroke
    final Paint borderPaint = Paint()
      ..shader = LinearGradient(
        colors: [
          color.withValues(alpha: 0.45),
          color.withValues(alpha: 0.15),
        ],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ).createShader(rect)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.2
      ..isAntiAlias = true;

    canvas.drawRRect(rrect, fillPaint);
    canvas.drawRRect(rrect, borderPaint);
  }

  @override
  bool shouldRepaint(covariant CapsuleIndicatorPainter oldDelegate) {
    return oldDelegate.leftX != leftX ||
        oldDelegate.rightX != rightX ||
        oldDelegate.pillHeight != pillHeight ||
        oldDelegate.color != color ||
        oldDelegate.centerY != centerY;
  }
}
