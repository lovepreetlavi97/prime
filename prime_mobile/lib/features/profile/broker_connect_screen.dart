import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../core/design_system.dart';

class BrokerConnectScreen extends StatefulWidget {
  const BrokerConnectScreen({super.key});

  @override
  State<BrokerConnectScreen> createState() => _BrokerConnectScreenState();
}

class _BrokerConnectScreenState extends State<BrokerConnectScreen> {
  String? _connectedBroker;

  final List<_BrokerItem> _brokers = const [
    _BrokerItem(name: 'Zerodha (Kite)', icon: Icons.offline_bolt_rounded, color: Colors.orange),
    _BrokerItem(name: 'AngelOne', icon: Icons.offline_bolt_rounded, color: Colors.blue),
    _BrokerItem(name: 'Groww', icon: Icons.offline_bolt_rounded, color: Colors.teal),
    _BrokerItem(name: 'Upstox', icon: Icons.offline_bolt_rounded, color: Colors.purple),
  ];

  void _openConnectDialog(BuildContext context, _BrokerItem broker) {
    final TextEditingController clientIdController = TextEditingController();
    final TextEditingController apiKeyController = TextEditingController();
    
    bool isSyncing = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
              ),
              child: Container(
                padding: const EdgeInsets.all(24.0),
                decoration: const BoxDecoration(
                  color: AppTheme.secondaryBackground,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(32),
                    topRight: Radius.circular(32),
                  ),
                  border: Border(
                    top: BorderSide(color: AppTheme.surfaceHighlight, width: 1.5),
                  ),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Sync ${broker.name}',
                          style: const TextStyle(fontFamily: 'Outfit', fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: Colors.white70),
                          onPressed: () => Navigator.of(context).pop(),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'All APIs are encrypted. Syncing allows you to execute options buy orders with one-click directly from details panels.',
                      style: TextStyle(color: AppTheme.textSecondary, fontSize: 12, height: 1.4),
                    ),
                    const SizedBox(height: 24),
                    
                    if (isSyncing) ...[
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.symmetric(vertical: 40.0),
                          child: Column(
                            children: [
                              CircularProgressIndicator(color: AppTheme.primary),
                              SizedBox(height: 16),
                              Text(
                                'SECURELY SYNCHRONIZING...',
                                style: TextStyle(
                                  color: AppTheme.primary,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 2.0,
                                ),
                              ),
                            ],
                          ),
                        ),
                      )
                    ] else ...[
                      // Client ID Input
                      const Text(
                        'CLIENT ID',
                        style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: AppTheme.primary, letterSpacing: 2.0),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        decoration: BoxDecoration(
                          color: AppTheme.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.surfaceHighlight),
                        ),
                        child: TextField(
                          controller: clientIdController,
                          style: const TextStyle(color: Colors.white, fontSize: 14),
                          decoration: const InputDecoration(
                            hintText: 'Enter your Client ID',
                            hintStyle: TextStyle(color: Colors.white24, fontSize: 13),
                            border: InputBorder.none,
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),

                      // API Key Input
                      const Text(
                        'API KEY / PASSCODE',
                        style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: AppTheme.primary, letterSpacing: 2.0),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        decoration: BoxDecoration(
                          color: AppTheme.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.surfaceHighlight),
                        ),
                        child: TextField(
                          controller: apiKeyController,
                          obscureText: true,
                          style: const TextStyle(color: Colors.white, fontSize: 14),
                          decoration: const InputDecoration(
                            hintText: 'Enter secure passcode',
                            hintStyle: TextStyle(color: Colors.white24, fontSize: 13),
                            border: InputBorder.none,
                          ),
                        ),
                      ),
                      const SizedBox(height: 32),

                      PremiumButton(
                        text: 'SYNC SECURELY',
                        onPressed: () {
                          if (clientIdController.text.isEmpty || apiKeyController.text.isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Please fill in both fields.'), backgroundColor: AppTheme.error),
                            );
                            return;
                          }
                          
                          setModalState(() {
                            isSyncing = true;
                          });

                          Timer(const Duration(seconds: 2), () {
                            Navigator.of(context).pop(); // Close sheet
                            setState(() {
                              _connectedBroker = broker.name;
                            });
                            _showSuccessAlert(broker.name);
                          });
                        },
                      ),
                    ],
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _showSuccessAlert(String name) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: AppTheme.secondaryBackground,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: BorderSide(color: AppTheme.surfaceHighlight)),
          title: const Row(
            children: [
              Icon(Icons.check_circle_rounded, color: AppTheme.success, size: 24),
              SizedBox(width: 8),
              Text('Connection Active', style: TextStyle(color: Colors.white, fontFamily: 'Outfit')),
            ],
          ),
          content: Text(
            'Successfully connected to $name. Automatic options order triggers are now enabled for Elite signals.',
            style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13, height: 1.4),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('DISMISS', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
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
          'Broker Sync',
          style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Select Broker',
              style: TextStyle(fontFamily: 'Outfit', fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Sync your trading accounts using official API bridges. All trades require biometric verification before dispatch.',
              style: TextStyle(color: AppTheme.textSecondary, fontSize: 13, height: 1.4),
            ),
            const SizedBox(height: 28),

            // Active connected status banner
            if (_connectedBroker != null) ...[
              GlassCard(
                borderColor: AppTheme.success.withValues(alpha: 0.3),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle_rounded, color: AppTheme.success, size: 20),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Active Bridge: $_connectedBroker',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ),
                    TextButton(
                      style: TextButton.styleFrom(padding: EdgeInsets.zero),
                      onPressed: () => setState(() => _connectedBroker = null),
                      child: const Text('DISCONNECT', style: TextStyle(color: AppTheme.error, fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],

            // Brokers list
            Expanded(
              child: ListView.builder(
                itemCount: _brokers.length,
                itemBuilder: (context, index) {
                  final broker = _brokers[index];
                  final isCurrent = _connectedBroker == broker.name;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12.0),
                    child: GestureDetector(
                      onTap: () {
                        if (isCurrent) return;
                        _openConnectDialog(context, broker);
                      },
                      child: GlassCard(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        borderColor: isCurrent ? AppTheme.success.withValues(alpha: 0.3) : null,
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: broker.color.withValues(alpha: 0.15),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(broker.icon, color: broker.color, size: 20),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Text(
                                broker.name,
                                style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 14),
                              ),
                            ),
                            if (isCurrent)
                              const Icon(Icons.check_circle_rounded, color: AppTheme.success, size: 18)
                            else
                              const Icon(Icons.chevron_right, color: AppTheme.textSecondary, size: 18),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BrokerItem {
  final String name;
  final IconData icon;
  final Color color;

  const _BrokerItem({
    required this.name,
    required this.icon,
    required this.color,
  });
}
