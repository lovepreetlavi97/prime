import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../core/design_system.dart';
import '../dashboard/dashboard_screen.dart';

class OtpLoginScreen extends StatefulWidget {
  const OtpLoginScreen({super.key});

  @override
  State<OtpLoginScreen> createState() => _OtpLoginScreenState();
}

class _OtpLoginScreenState extends State<OtpLoginScreen> {
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _otpController = TextEditingController();
  
  bool _isOtpSent = false;
  bool _isLoading = false;
  int _countdown = 30;
  Timer? _timer;

  @override
  void dispose() {
    _phoneController.dispose();
    _otpController.dispose();
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _countdown = 30;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        if (_countdown > 0) {
          _countdown--;
        } else {
          _timer?.cancel();
        }
      });
    });
  }

  void _sendOtp() {
    if (_phoneController.text.length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a valid 10-digit phone number.'),
          backgroundColor: AppTheme.error,
        ),
      );
      return;
    }
    
    setState(() {
      _isLoading = true;
    });

    // Simulate network delay
    Timer(const Duration(milliseconds: 1200), () {
      setState(() {
        _isLoading = false;
        _isOtpSent = true;
      });
      _startTimer();
    });
  }

  void _verifyOtp() {
    String otp = _otpController.text;
    if (otp.length < 4) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter the verification code.'),
          backgroundColor: AppTheme.error,
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    // Simulate OTP verification and login
    Timer(const Duration(milliseconds: 1500), () {
      setState(() {
        _isLoading = false;
      });
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const DashboardScreen()),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            physics: const BouncingScrollPhysics(),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                
                // CENTERED LOGO
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const LvxLogo(size: 32),
                    const SizedBox(width: 10),
                    const Text(
                      'PRIME',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const Text(
                      'TRADE',
                      style: TextStyle(
                        color: AppTheme.primary,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 32),
                
                // Title Header
                const Text(
                  'Welcome Back',
                  style: TextStyle(
                    fontFamily: 'Outfit',
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  _isOtpSent 
                      ? 'Enter the OTP sent to your phone'
                      : 'Enter your phone number to continue',
                  style: const TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 13,
                  ),
                ),
                
                const SizedBox(height: 32),
                
                // Card Container (Subtle gold border)
                Container(
                  padding: const EdgeInsets.all(24.0),
                  decoration: BoxDecoration(
                    color: AppTheme.secondaryBackground,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: AppTheme.primary.withValues(alpha: 0.15)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (!_isOtpSent) ...[
                        // PHONE ENTRY STATE
                        const Text(
                          'Phone Number',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.02),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.phone_outlined, color: AppTheme.textSecondary, size: 18),
                              const SizedBox(width: 12),
                              const Text(
                                '+91',
                                style: TextStyle(color: AppTheme.textSecondary, fontSize: 15, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: TextField(
                                  controller: _phoneController,
                                  keyboardType: TextInputType.phone,
                                  maxLength: 10,
                                  style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.semibold),
                                  decoration: const InputDecoration(
                                    border: InputBorder.none,
                                    counterText: '',
                                    hintText: 'Enter 10 digit number',
                                    hintStyle: TextStyle(color: Colors.white24, fontSize: 15),
                                    isDense: true,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),
                        PremiumButton(
                          text: 'Send OTP',
                          isLoading: _isLoading,
                          onPressed: _sendOtp,
                        ),
                      ] else ...[
                        // OTP ENTRY STATE
                        const Text(
                          'Enter OTP',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.02),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.lock_outline_rounded, color: AppTheme.textSecondary, size: 18),
                              const SizedBox(width: 12),
                              Expanded(
                                child: TextField(
                                  controller: _otpController,
                                  keyboardType: TextInputType.number,
                                  maxLength: 6,
                                  style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.semibold, letterSpacing: 2.0),
                                  decoration: const InputDecoration(
                                    border: InputBorder.none,
                                    counterText: '',
                                    hintText: 'Enter 6 digit OTP',
                                    hintStyle: TextStyle(color: Colors.white24, fontSize: 15, letterSpacing: 0.0),
                                    isDense: true,
                                  ),
                                  onChanged: (val) {
                                    if (val.length == 4 || val.length == 6) {
                                      _verifyOtp();
                                    }
                                  },
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                        // Resend link
                        Center(
                          child: TextButton(
                            onPressed: _countdown == 0 ? () {
                              _startTimer();
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('OTP Resent successfully. Code: 1111')),
                              );
                            } : null,
                            child: Text(
                              _countdown > 0 ? 'Resend OTP in ${_countdown}s' : 'Resend OTP',
                              style: TextStyle(
                                color: _countdown > 0 ? AppTheme.textSecondary : AppTheme.primary,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        PremiumButton(
                          text: 'Verify & Continue',
                          isLoading: _isLoading,
                          onPressed: _verifyOtp,
                        ),
                        const SizedBox(height: 12),
                        Center(
                          child: TextButton(
                            onPressed: () {
                              setState(() {
                                _isOtpSent = false;
                                _otpController.clear();
                              });
                            },
                            child: const Text(
                              'Change phone number',
                              style: TextStyle(
                                color: AppTheme.textSecondary,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ]
                    ],
                  ),
                ),
                
                const SizedBox(height: 48),
                
                // Bottom disclaimer
                Text(
                  'By continuing, you agree to our Terms & Privacy Policy',
                  style: TextStyle(
                    fontSize: 10,
                    color: AppTheme.textSecondary.withValues(alpha: 0.5),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
