import 'dart:convert';
import 'dart:developer';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as socket_io;
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../features/signals/signals_list_view.dart';

final socketServiceProvider = Provider((ref) => SocketService());

// State providers for real-time price feeds
final niftyPriceProvider = StateProvider<String>((ref) => '₹24,235.00');
final bankNiftyPriceProvider = StateProvider<String>((ref) => '₹51,820.00');
final userTierProvider = StateProvider<String>((ref) => 'free');

// State providers for live data synchronization
final signalsListProvider = StateProvider<List<SignalData>>((ref) => []);
final backendUrlProvider = StateProvider<String>((ref) => 'http://10.0.2.2:4000'); // Default to Android emulator host loopback
final packagesListProvider = StateProvider<List<dynamic>>((ref) => []);

class SocketService {
  socket_io.Socket? socket;

  void init(WidgetRef ref) async {
    final prefs = await SharedPreferences.getInstance();
    final String savedUrl = prefs.getString('backend_url') ?? 'http://10.0.2.2:4000';
    ref.read(backendUrlProvider.notifier).state = savedUrl;

    log('Initializing Socket.io connection to $savedUrl');
    
    // Close existing socket if active
    socket?.disconnect();
    socket?.destroy();
    
    // Connect to WebSocket gateway
    socket = socket_io.io(savedUrl, socket_io.OptionBuilder()
      .setTransports(['websocket'])
      .disableAutoConnect()
      .setAuth({
        'userId': 'mock-flutter-user',
        'tier': 'elite'
      })
      .build());

    socket!.onConnect((_) {
      log('✅ Flutter connected to PrimeTrade WebSocket Gateway');
      socket!.emit('subscribe_market', '13'); // NIFTY 50
      socket!.emit('subscribe_market', '25'); // BANKNIFTY
    });

    socket!.on('market_feed', (data) {
      if (data['instrument'] == 'NIFTY 50') {
        ref.read(niftyPriceProvider.notifier).state = '₹${data['price']}';
      } else if (data['instrument'] == 'BANKNIFTY') {
        ref.read(bankNiftyPriceProvider.notifier).state = '₹${data['price']}';
      }
    });

    // Real-time signal mutations
    socket!.on('new_signal', (data) {
      log('Socket: new_signal received');
      final newSignal = mapJsonToSignal(data);
      ref.read(signalsListProvider.notifier).update((state) {
        return [newSignal, ...state.where((s) => s.id != newSignal.id)];
      });
    });

    socket!.on('update_signal', (data) {
      log('Socket: update_signal received');
      final updated = mapJsonToSignal(data);
      ref.read(signalsListProvider.notifier).update((state) {
        return state.map((s) => s.id == updated.id ? updated : s).toList();
      });
    });

    socket!.on('signal_updates', (data) {
      log('Socket: signal_updates received');
      final updated = mapJsonToSignal(data);
      ref.read(signalsListProvider.notifier).update((state) {
        return state.map((s) => s.id == updated.id ? updated : s).toList();
      });
    });

    socket!.on('signal_closed', (data) {
      log('Socket: signal_closed received');
      final closed = mapJsonToSignal(data);
      ref.read(signalsListProvider.notifier).update((state) {
        return state.map((s) => s.id == closed.id ? closed : s).toList();
      });
    });

    socket!.onDisconnect((_) => log('⚠️ Socket connection closed'));

    socket!.connect();
    
    // Perform initial API fetches
    fetchInitialSignals(ref, savedUrl);
    fetchPackages(ref, savedUrl);
  }

  Future<void> fetchInitialSignals(WidgetRef ref, String baseUrl) async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/api/v1/signals'));
      if (res.statusCode == 200) {
        final List<dynamic> data = json.decode(res.body);
        final list = data.map((x) => mapJsonToSignal(x)).toList();
        ref.read(signalsListProvider.notifier).state = list;
        log('📦 Initial signals fetched: ${list.length}');
      }
    } catch (e) {
      log('❌ Failed to fetch initial signals: $e');
    }
  }

  Future<void> fetchPackages(WidgetRef ref, String baseUrl) async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/api/v1/subscriptions/packages'));
      if (res.statusCode == 200) {
        final List<dynamic> data = json.decode(res.body);
        ref.read(packagesListProvider.notifier).state = data;
        log('📦 Subscriptions packages fetched: ${data.length}');
      }
    } catch (e) {
      log('❌ Failed to fetch packages: $e');
    }
  }

  void disconnect() {
    socket?.disconnect();
  }

  // --- MAPPING HELPERS ---
  SignalData mapJsonToSignal(Map<String, dynamic> json) {
    final List<dynamic> tgts = json['targets'] ?? [];
    final double targetVal = tgts.isNotEmpty ? (tgts[0] as num).toDouble() : 0.0;
    const String risk = 'Low Risk';
    
    final String status = json['status'] ?? 'ACTIVE';
    final bool isClosed = status.startsWith('CLOSED') || status == 'SL_HIT' || status == 'EXIT_ALERT';
    final bool isProfit = status == 'CLOSED_PROFIT' || status == 'TARGET_HIT' || status == 'PROFIT';

    return SignalData(
      id: json['_id'] ?? '',
      symbol: json['symbol'] ?? 'NIFTY',
      strike: '${json['strike'] ?? ''} ${json['optionType'] ?? ''}',
      type: 'BUY OPTION',
      entry: (json['entry'] as num?)?.toDouble() ?? 0.0,
      target: targetVal,
      stopLoss: (json['sl'] as num?)?.toDouble() ?? 0.0,
      confidence: json['confidenceScore'] ?? 90,
      riskLevel: json['rating'] ?? risk,
      time: 'Live Now',
      reasoning: json['aiRationale'] ?? json['rawText'] ?? 'AI confirmation secured.',
      isClosed: isClosed,
      isProfit: isProfit,
      exitPrice: (json['currentPrice'] as num?)?.toDouble() ?? (json['entry'] as num?)?.toDouble() ?? 0.0,
    );
  }
}
