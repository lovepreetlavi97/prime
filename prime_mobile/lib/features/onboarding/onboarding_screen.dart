import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../core/design_system.dart';
import '../auth/otp_login_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingData> _pages = [
    OnboardingData(
      title: 'Real-Time Signals',
      subtitle: 'Get precise entry, exit, and stop-loss levels before the crowd moves.',
      icon: Icons.trending_up_rounded,
      accentColor: AppTheme.success,
      moodName: 'enter before the crowd',
      backgroundColor: const Color(0xFF0E2F1F),
    ),
    OnboardingData(
      title: 'AI Guidance',
      subtitle: 'Avoid emotional trades with intelligent market structure analysis.',
      icon: Icons.psychology_rounded,
      accentColor: AppTheme.primary,
      moodName: 'disciplined approach',
      backgroundColor: const Color(0xFF302710),
    ),
    OnboardingData(
      title: 'Instant Alerts',
      subtitle: 'Never miss a setup with real-time push notifications.',
      icon: Icons.notifications_active_rounded,
      accentColor: AppTheme.error,
      moodName: 'capture every setup',
      backgroundColor: const Color(0xFF331414),
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _onNext() {
    if (_currentPage < _pages.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    } else {
      _navigateToLogin();
    }
  }

  void _navigateToLogin() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const OtpLoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: Column(
            children: [
              // Top Bar with Skip Button
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const LvxLogo(size: 24),
                      const SizedBox(width: 8),
                      RichText(
                        text: const TextSpan(
                          style: TextStyle(
                            fontFamily: 'Outfit',
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.0,
                          ),
                          children: [
                            TextSpan(text: 'PRIME', style: TextStyle(color: Colors.white)),
                            TextSpan(text: 'TRADE', style: TextStyle(color: AppTheme.primary)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  TextButton(
                    onPressed: _navigateToLogin,
                    child: Text(
                      'Skip',
                      style: TextStyle(
                        color: AppTheme.textSecondary.withValues(alpha: 0.8),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              
              // Slide Content (Expanded PageView)
              Expanded(
                child: PageView.builder(
                  controller: _pageController,
                  onPageChanged: (index) {
                    setState(() {
                      _currentPage = index;
                    });
                  },
                  itemCount: _pages.length,
                  itemBuilder: (context, index) {
                    final item = _pages[index];
                    return Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Giant Glowing Feature Illustration Card
                        Container(
                          width: 240,
                          height: 240,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: RadialGradient(
                              colors: [
                                item.accentColor.withValues(alpha: 0.15),
                                Colors.transparent,
                              ],
                            ),
                          ),
                          alignment: Alignment.center,
                          child: Container(
                            width: 140,
                            height: 140,
                            decoration: BoxDecoration(
                              color: item.backgroundColor,
                              borderRadius: BorderRadius.circular(32),
                              border: Border.all(
                                color: item.accentColor.withValues(alpha: 0.3),
                                width: 1.5,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: item.accentColor.withValues(alpha: 0.1),
                                  blurRadius: 24,
                                ),
                              ],
                            ),
                            child: Icon(
                              item.icon,
                              size: 64,
                              color: item.accentColor,
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        // Badge
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: item.accentColor.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(100),
                            border: Border.all(color: item.accentColor.withValues(alpha: 0.2)),
                          ),
                          child: Text(
                            item.moodName.toUpperCase(),
                            style: TextStyle(
                              color: item.accentColor,
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 2.0,
                            ),
                          ),
                        ),
                        const SizedBox(height: 32),
                        // Title
                        Text(
                          item.title,
                          style: const TextStyle(
                            fontFamily: 'Outfit',
                            fontSize: 30,
                            fontWeight: FontWeight.bold,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 16),
                        // Subtitle
                        Text(
                          item.subtitle,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 15,
                            color: AppTheme.textSecondary,
                            height: 1.5,
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),

              // Page Indicator Dots
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  _pages.length,
                  (index) => AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    width: _currentPage == index ? 24 : 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: _currentPage == index ? AppTheme.primary : AppTheme.surfaceHighlight,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
              ),
              
              const SizedBox(height: 32),
              
              // Bottom Action Button
              PremiumButton(
                text: _currentPage == _pages.length - 1 ? 'GET STARTED' : 'CONTINUE',
                onPressed: _onNext,
              ),
              
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}

class OnboardingData {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color accentColor;
  final String moodName;
  final Color backgroundColor;

  OnboardingData({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.accentColor,
    required this.moodName,
    required this.backgroundColor,
  });
}
