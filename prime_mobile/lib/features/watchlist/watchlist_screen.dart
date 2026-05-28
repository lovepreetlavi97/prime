import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../core/design_system.dart';

class WatchlistScreen extends StatefulWidget {
  const WatchlistScreen({super.key});

  @override
  State<WatchlistScreen> createState() => _WatchlistScreenState();
}

class _WatchlistScreenState extends State<WatchlistScreen> {
  final List<WatchlistItem> _items = [
    WatchlistItem(symbol: 'NIFTY 50', type: 'Index', price: '23,956.40', change: '+0.33%', isUp: true),
    WatchlistItem(symbol: 'BANKNIFTY', type: 'Index', price: '52,270.15', change: '+1.67%', isUp: true),
    WatchlistItem(symbol: 'NIFTY 23500 CE', type: 'CE Option', price: '₹239.50', change: '+12.4%', isUp: true),
    WatchlistItem(symbol: 'BANKNIFTY 52200 PE', type: 'PE Option', price: '₹410.00', change: '-4.8%', isUp: false),
    WatchlistItem(symbol: 'FINNIFTY', type: 'Index', price: '24,120.30', change: '+0.88%', isUp: true),
  ];

  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
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
          'My Watchlist',
          style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0),
        child: Column(
          children: [
            const SizedBox(height: 8),
            // Search Input
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: AppTheme.secondaryBackground,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.surfaceHighlight),
              ),
              child: TextField(
                controller: _searchController,
                style: const TextStyle(color: Colors.white, fontSize: 14),
                decoration: const InputDecoration(
                  icon: Icon(Icons.search, color: AppTheme.textSecondary),
                  hintText: 'Search Index or Options contracts...',
                  hintStyle: TextStyle(color: Colors.white24, fontSize: 14),
                  border: InputBorder.none,
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Watchlist list
            Expanded(
              child: ListView.builder(
                itemCount: _items.length,
                physics: const BouncingScrollPhysics(),
                itemBuilder: (context, index) {
                  final item = _items[index];
                  return Dismissible(
                    key: Key(item.symbol),
                    direction: DismissDirection.endToStart,
                    background: Container(
                      alignment: Alignment.centerRight,
                      padding: const EdgeInsets.only(right: 20.0),
                      decoration: BoxDecoration(
                        color: AppTheme.error.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Icon(Icons.delete_outline, color: AppTheme.error),
                    ),
                    onDismissed: (direction) {
                      setState(() {
                        _items.removeAt(index);
                      });
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('${item.symbol} removed from Watchlist')),
                      );
                    },
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 12.0),
                      child: GlassCard(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.symbol,
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  item.type,
                                  style: const TextStyle(color: AppTheme.textSecondary, fontSize: 10),
                                ),
                              ],
                            ),
                            Row(
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text(
                                      item.price,
                                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 14),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      item.change,
                                      style: TextStyle(
                                        color: item.isUp ? AppTheme.success : AppTheme.error,
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(width: 12),
                                Icon(
                                  Icons.chevron_right,
                                  color: AppTheme.textSecondary.withValues(alpha: 0.5),
                                  size: 18,
                                )
                              ],
                            )
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

class WatchlistItem {
  final String symbol;
  final String type;
  final String price;
  final String change;
  final bool isUp;

  WatchlistItem({
    required this.symbol,
    required this.type,
    required this.price,
    required this.change,
    required this.isUp,
  });
}
