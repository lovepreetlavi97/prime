import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/theme.dart';
import '../../core/design_system.dart';
import '../../core/socket_service.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _soundAlerts = true;
  bool _pushNotifications = true;
  bool _volatilityWarnings = true;
  bool _fiiActivityLogs = false;
  
  final TextEditingController _urlController = TextEditingController();
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  void _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    final String currentUrl = prefs.getString('backend_url') ?? 'http://10.0.2.2:4000';
    setState(() {
      _urlController.text = currentUrl;
    });
  }

  void _saveSettings() async {
    setState(() {
      _isSaving = true;
    });
    final prefs = await SharedPreferences.getInstance();
    String newUrl = _urlController.text.trim();
    
    // Auto-formatting helper
    if (newUrl.isNotEmpty && !newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
      newUrl = 'http://$newUrl';
    }
    
    await prefs.setString('backend_url', newUrl);
    ref.read(backendUrlProvider.notifier).state = newUrl;
    
    // Reinitialize sockets and reload signals/packages
    ref.read(socketServiceProvider).init(ref);
    
    setState(() {
      _isSaving = false;
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Server URL updated to $newUrl'),
          backgroundColor: AppTheme.success,
        ),
      );
    }
  }

  @override
  void dispose() {
    _urlController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'App Settings',
          style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20.0),
        physics: const BouncingScrollPhysics(),
        children: [
          const Text(
            'SERVER CONFIGURATION',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppTheme.textSecondary, letterSpacing: 1.5),
          ),
          const SizedBox(height: 12),
          
          GlassCard(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Backend Server Endpoint',
                  style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 13),
                ),
                const SizedBox(height: 4),
                Text(
                  'Configure local IP (e.g. 192.168.1.15:4000) for physical device testing.',
                  style: TextStyle(color: AppTheme.textSecondary.withOpacity(0.8), fontSize: 10),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _urlController,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: InputDecoration(
                    hintText: 'http://192.168.x.x:4000',
                    hintStyle: const TextStyle(color: AppTheme.textSecondary),
                    filled: true,
                    fillColor: Colors.black.withOpacity(0.4),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppTheme.surfaceHighlight),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppTheme.primary),
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _isSaving ? null : _saveSettings,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    minimumSize: const Size(double.infinity, 44),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isSaving 
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                    : const Text('Save & Reconnect', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 12)),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          const Text(
            'ALERT TRIGGERS',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppTheme.textSecondary, letterSpacing: 1.5),
          ),
          const SizedBox(height: 12),
          
          _buildSwitchItem(
            title: 'Sound Notification Triggers',
            subtitle: 'Play custom acoustic sounds for incoming signals',
            value: _soundAlerts,
            onChanged: (val) => setState(() => _soundAlerts = val),
          ),
          
          _buildSwitchItem(
            title: 'Push Alerts Feed',
            subtitle: 'Deliver immediate option targets to notifications drawer',
            value: _pushNotifications,
            onChanged: (val) => setState(() => _pushNotifications = val),
          ),

          const SizedBox(height: 24),
          const Text(
            'AI MARKET MONITOR CONFIG',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppTheme.textSecondary, letterSpacing: 1.5),
          ),
          const SizedBox(height: 12),
          
          _buildSwitchItem(
            title: 'Spike Warnings',
            subtitle: 'Alert when India VIX climbs more than 5% instantly',
            value: _volatilityWarnings,
            onChanged: (val) => setState(() => _volatilityWarnings = val),
          ),
          
          _buildSwitchItem(
            title: 'FII/DII Net Flow Logs',
            subtitle: 'Log net institutional block orders updates',
            value: _fiiActivityLogs,
            onChanged: (val) => setState(() => _fiiActivityLogs = val),
          ),
        ],
      ),
    );
  }

  Widget _buildSwitchItem({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: GlassCard(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 13),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: const TextStyle(color: AppTheme.textSecondary, fontSize: 10, height: 1.3),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Switch.adaptive(
              activeColor: AppTheme.primary,
              value: value,
              onChanged: onChanged,
            )
          ],
        ),
      ),
    );
  }
}
