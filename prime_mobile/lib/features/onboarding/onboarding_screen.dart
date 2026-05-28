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
      title: 'Clarity Over Emotion',
      subtitle: 'Market noise causes bad trades. LVPrimeX delivers calm, objective, AI-filtered intelligence to improve your execution.',
      icon: Icons.psychology_outlined,
      accentColor: AppTheme.primary,
      moodName: 'calm & focused',
    ),
    OnboardingData(
      title: 'Elite Options Signals',
      subtitle: 'Receive real-time option setups for NIFTY & BANKNIFTY with precise entry targets, stop losses, and transparent AI reasoning.',
      icon: Icons.radar_outlined,
      accentColor: AppTheme.secondary,
      moodName: 'high confidence',
    ),
    OnboardingData(
      title: 'Disciplined Journaling',
      subtitle: 'Eliminate overtrading. Log trade setups, track psychological tags, and let AI analyze your execution discipline.',
      icon: Icons.auto_stories_outlined,
      accentColor: AppTheme.warning,
      moodName: 'win-rate optimization',
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
                  const Text(
                    'LVPrimeX',
                    style: TextStyle(
                      fontFamily: 'Outfit',
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                    ),
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
                              color: AppTheme.secondaryBackground,
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

  OnboardingData({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.accentColor,
    required this.moodName,
  });
}
