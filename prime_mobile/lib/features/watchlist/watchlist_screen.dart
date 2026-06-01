import 'dart:convert';
import 'dart:developer';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../../core/theme.dart';
import '../../core/design_system.dart';
import '../../core/socket_service.dart';
import '../signals/signals_list_view.dart';

class WatchlistScreen extends ConsumerStatefulWidget {
  const WatchlistScreen({super.key});

  @override
  ConsumerState<WatchlistScreen> createState() => _WatchlistScreenState();
}

class _WatchlistScreenState extends ConsumerState<WatchlistScreen> {
  final List<WatchlistItem> _items = [
    WatchlistItem(symbol: 'NIFTY 50', type: 'Index', defaultPrice: '24,230.85', defaultChange: '+0.00%', defaultIsUp: true),
    WatchlistItem(symbol: 'BANKNIFTY', type: 'Index', defaultPrice: '51,275.05', defaultChange: '+0.00%', defaultIsUp: true),
    WatchlistItem(symbol: 'FINNIFTY', type: 'Index', defaultPrice: '24,120.30', defaultChange: '+0.00%', defaultIsUp: true),
    WatchlistItem(symbol: 'SENSEX', type: 'Index', defaultPrice: '79,040.36', defaultChange: '+0.00%', defaultIsUp: true),
  ];

  List<dynamic> _availableInstruments = [];
  bool _isLoadingInstruments = false;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_onSearchChanged);
    // Fetch available instruments from backend on load
    Future.microtask(() => _fetchAvailableInstruments());
  }

  void _onSearchChanged() {
    setState(() {
      _searchQuery = _searchController.text.trim();
    });
  }

  void _fetchAvailableInstruments() async {
    setState(() {
      _isLoadingInstruments = true;
    });
    try {
      final savedUrl = ref.read(backendUrlProvider);
      final res = await http.get(Uri.parse('$savedUrl/api/v1/market/instruments'));
      if (res.statusCode == 200) {
        final decoded = json.decode(res.body);
        if (decoded['success'] == true) {
          setState(() {
            _availableInstruments = decoded['data'];
          });
        }
      }
    } catch (e) {
      log('❌ Failed to fetch available instruments: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoadingInstruments = false;
        });
      }
    }
  }

  void _addInstrumentToWatchlist(Map<String, dynamic> inst) {
    final String name = inst['name'] ?? '';
    if (name.isEmpty) return;
    
    // Check duplicate
    if (_items.any((item) => item.symbol.toLowerCase() == name.toLowerCase())) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('$name is already in your Watchlist')),
      );
      return;
    }

    setState(() {
      _items.add(WatchlistItem(
        symbol: name,
        type: inst['exchange'] ?? 'Index',
        defaultPrice: '0.00',
        defaultChange: '+0.00%',
        defaultIsUp: true,
      ));
      _searchController.clear();
      _searchQuery = '';
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$name added to Watchlist'), backgroundColor: AppTheme.success),
    );
  }

  @override
  void dispose() {
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final priceInfoMap = ref.watch(livePriceInfoProvider);
    final allSignals = ref.watch(signalsListProvider);

    // Filter instruments for search overlay
    final filteredInstruments = _searchQuery.isEmpty
        ? []
        : _availableInstruments.where((inst) {
            final name = (inst['name'] ?? '').toString().toLowerCase();
            return name.contains(_searchQuery.toLowerCase());
          }).toList();

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
                decoration: InputDecoration(
                  icon: const Icon(Icons.search, color: AppTheme.textSecondary),
                  suffixIcon: _searchQuery.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear, color: AppTheme.textSecondary, size: 16),
                          onPressed: () => _searchController.clear(),
                        )
                      : null,
                  hintText: 'Search Index or Contracts...',
                  hintStyle: const TextStyle(color: Colors.white24, fontSize: 14),
                  border: InputBorder.none,
                ),
              ),
            ),
            const SizedBox(height: 10),

            // Search overlay results or list
            Expanded(
              child: Stack(
                children: [
                  // Watchlist list view
                  ListView.builder(
                    itemCount: _items.length,
                    physics: const BouncingScrollPhysics(),
                    itemBuilder: (context, index) {
                      final item = _items[index];

                      String displayPrice = item.defaultPrice;
                      String displayChange = item.defaultChange;
                      bool isUp = item.defaultIsUp;

                      if (priceInfoMap.containsKey(item.symbol)) {
                        final data = priceInfoMap[item.symbol]!;
                        displayPrice = data['price'] as String? ?? item.defaultPrice;
                        displayChange = data['change'] as String? ?? item.defaultChange;
                        isUp = data['isUp'] as bool? ?? item.defaultIsUp;
                      } else {
                        // Check if item symbol is an option inside active signals
                        final matchedSignal = allSignals.firstWhere(
                          (s) => '${s.symbol} ${s.strike}' == item.symbol || s.symbol == item.symbol,
                          orElse: () => SignalData(id: '', symbol: '', strike: '', type: '', entry: 0, target: 0, stopLoss: 0, confidence: 0, riskLevel: '', time: '', reasoning: ''),
                        );
                        if (matchedSignal.id.isNotEmpty) {
                          final double currentOptionPrice = matchedSignal.isClosed 
                              ? (matchedSignal.exitPrice ?? matchedSignal.entry)
                              : matchedSignal.entry;
                          displayPrice = '₹${currentOptionPrice.toStringAsFixed(2)}';
                          
                          if (matchedSignal.entry > 0) {
                            final change = (currentOptionPrice - matchedSignal.entry) / matchedSignal.entry * 100;
                            displayChange = '${change >= 0 ? "+" : ""}${change.toStringAsFixed(1)}%';
                            isUp = change >= 0;
                          }
                        }
                      }

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
                                          displayPrice,
                                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 14),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          displayChange,
                                          style: TextStyle(
                                            color: isUp ? AppTheme.success : AppTheme.error,
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
                  
                  // Search Overlay Results
                  if (_searchQuery.isNotEmpty)
                    Positioned.fill(
                      child: Container(
                        color: AppTheme.background,
                        child: _isLoadingInstruments
                            ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
                            : filteredInstruments.isEmpty
                                ? const Center(
                                    child: Text(
                                      'No instruments matched',
                                      style: TextStyle(color: AppTheme.textSecondary),
                                    ),
                                  )
                                : ListView.builder(
                                    itemCount: filteredInstruments.length,
                                    itemBuilder: (context, idx) {
                                      final inst = filteredInstruments[idx];
                                      final String name = inst['name'] ?? '';
                                      final String exch = inst['exchange'] ?? 'NSE';
                                      return ListTile(
                                        title: Text(name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                                        subtitle: Text(exch, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                                        trailing: const Icon(Icons.add_circle_outline_rounded, color: AppTheme.primary),
                                        onTap: () => _addInstrumentToWatchlist(inst),
                                      );
                                    },
                                  ),
                      ),
                    ),
                ],
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
  final String defaultPrice;
  final String defaultChange;
  final bool defaultIsUp;

  WatchlistItem({
    required this.symbol,
    required this.type,
    required this.defaultPrice,
    required this.defaultChange,
    required this.defaultIsUp,
  });
}

