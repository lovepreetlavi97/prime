import 'dart:convert';
import 'dart:developer';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as socket_io;
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import '../features/signals/signals_list_view.dart';

final socketServiceProvider = Provider((ref) => SocketService(ref));

// State providers for real-time price feeds
final niftyPriceProvider = StateProvider<String>((ref) => '₹24,235.00');
final bankNiftyPriceProvider = StateProvider<String>((ref) => '₹51,820.00');
final userTierProvider = StateProvider<String>((ref) => 'free');

// Dynamic map provider for live price details of any instrument
final livePriceInfoProvider = StateProvider<Map<String, Map<String, dynamic>>>((ref) => {
  'NIFTY 50': {'price': '₹24,235.00', 'change': '+0.00%', 'isUp': true},
  'BANKNIFTY': {'price': '₹51,820.00', 'change': '+0.00%', 'isUp': true},
  'FINNIFTY': {'price': '₹24,120.30', 'change': '+0.00%', 'isUp': true},
  'SENSEX': {'price': '₹79,040.36', 'change': '+0.00%', 'isUp': true},
  'INDIA VIX': {'price': '18.60', 'change': '+0.00%', 'isUp': true},
  'USD-INR': {'price': '84.58', 'change': '+0.00%', 'isUp': true},
});

// Dynamic content fetched from backend /api/home-content
final homeContentProvider = StateProvider<Map<String, dynamic>?>((ref) => null);

// Dynamic AI Sentiment fetched from backend
final aiSentimentProvider = StateProvider<Map<String, dynamic>?>((ref) => null);

// Dynamic currentUser profile info fetched from /api/v1/profile/me
final currentUserProvider = StateProvider<Map<String, dynamic>?>((ref) => null);

// Dynamic reactive notifications list
final notificationsProvider = StateProvider<List<Map<String, dynamic>>>((ref) => []);

// State providers for live data synchronization
final signalsListProvider = StateProvider<List<SignalData>>((ref) => []);
final backendUrlProvider = StateProvider<String>((ref) => 'http://192.168.1.9:4000'); // Default to local host machine IP
final packagesListProvider = StateProvider<List<dynamic>>((ref) => []);


class SocketService {
  final Ref ref;
  SocketService(this.ref);

  socket_io.Socket? socket;

  void init() async {
    final prefs = await SharedPreferences.getInstance();
    String savedUrl = prefs.getString('backend_url') ?? 'http://192.168.1.9:4000';
    if (savedUrl.contains('localhost') || savedUrl.contains('10.0.2.2') || savedUrl.contains('192.168.1.15')) {
      savedUrl = 'http://192.168.1.9:4000';
      await prefs.setString('backend_url', savedUrl);
    }
    ref.read(backendUrlProvider.notifier).state = savedUrl;

    final String? token = prefs.getString('auth_token');
    final String plan = prefs.getString('user_plan') ?? 'free';
    ref.read(userTierProvider.notifier).state = plan;

    log('Initializing Socket.io connection to $savedUrl with plan $plan');
    
    // Close existing socket if active
    socket?.disconnect();
    socket?.destroy();
    
    // Connect to WebSocket gateway
    socket = socket_io.io(savedUrl, socket_io.OptionBuilder()
      .setTransports(['websocket'])
      .disableAutoConnect()
      .setAuth({
        'token': token,
        'userId': token != null ? 'dynamic-user' : 'mock-flutter-user',
        'tier': plan
      })
      .build());

    socket!.onConnect((_) {
      log('✅ Flutter connected to PrimeTrade WebSocket Gateway');
      socket!.emit('subscribe_market', '13'); // NIFTY 50
      socket!.emit('subscribe_market', '25'); // BANKNIFTY
    });

    socket!.on('market_feed', (data) {
      final String instrument = data['instrument'] ?? '';
      final double priceVal = (data['price'] as num?)?.toDouble() ?? 0.0;
      final double changePercent = (data['changePercent'] as num?)?.toDouble() ?? 0.0;
      final bool isUp = changePercent >= 0;
      final String changeStr = '${isUp ? "+" : ""}${changePercent.toStringAsFixed(2)}%';
      
      if (instrument.isNotEmpty) {
        ref.read(livePriceInfoProvider.notifier).update((state) {
          final newState = Map<String, Map<String, dynamic>>.from(state);
          newState[instrument] = {
            'price': '₹${priceVal.toStringAsFixed(2)}',
            'change': changeStr,
            'isUp': isUp,
          };
          return newState;
        });
      }

      final priceStr = '₹${priceVal.toStringAsFixed(2)}';
      if (instrument == 'NIFTY 50') {
        ref.read(niftyPriceProvider.notifier).state = priceStr;
      } else if (instrument == 'BANKNIFTY') {
        ref.read(bankNiftyPriceProvider.notifier).state = priceStr;
      }
    });

    // Real-time signal mutations
    socket!.on('new_signal', (data) {
      log('Socket: new_signal received');
      final newSignal = mapJsonToSignal(data);
      ref.read(signalsListProvider.notifier).update((state) {
        return [newSignal, ...state.where((s) => s.id != newSignal.id)];
      });
      
      // Push alert to notifications list
      ref.read(notificationsProvider.notifier).update((state) {
        return [
          {
            'title': 'New Signal Alert: ${newSignal.symbol}',
            'desc': '${newSignal.symbol} ${newSignal.strike} buy alert triggered. Entry ₹${newSignal.entry.toStringAsFixed(1)}, target ₹${newSignal.target.toStringAsFixed(1)}.',
            'time': 'Just now',
            'icon': 'radar',
            'iconColor': 'primary',
          },
          ...state
        ];
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

      // Push close alert to notifications list
      ref.read(notificationsProvider.notifier).update((state) {
        return [
          {
            'title': '${closed.symbol} ${closed.strike} ${closed.isProfit ? "Target Achieved" : "Stop Loss Hit"}',
            'desc': closed.isProfit 
                ? 'Option target hit at ₹${(closed.exitPrice ?? closed.entry).toStringAsFixed(1)}. Net profit expansion completed.'
                : 'Stop loss hit at ₹${(closed.exitPrice ?? closed.entry).toStringAsFixed(1)}. Risk management exit.',
            'time': 'Just now',
            'icon': closed.isProfit ? 'check_circle' : 'cancel',
            'iconColor': closed.isProfit ? 'success' : 'error',
          },
          ...state
        ];
      });
    });

    socket!.onDisconnect((_) => log('⚠️ Socket connection closed'));

    socket!.connect();
    
    // Perform initial API fetches
    fetchInitialSignals(savedUrl);
    fetchPackages(savedUrl);
    fetchHomeContent(savedUrl);
    fetchAiSentiment(savedUrl);

    if (token != null) {
      fetchUserProfile(savedUrl, token);
      setupFcm(savedUrl, token);
    }
  }

  Future<void> fetchInitialSignals(String baseUrl) async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/api/v1/signals'));
      if (res.statusCode == 200) {
        final List<dynamic> data = json.decode(res.body);
        final list = data.map((x) => mapJsonToSignal(x)).toList();
        ref.read(signalsListProvider.notifier).state = list;
        log('📦 Initial signals fetched: ${list.length}');
        
        generateInitialNotifications(list);
      }
    } catch (e) {
      log('❌ Failed to fetch initial signals: $e');
    }
  }

  void generateInitialNotifications(List<SignalData> signals) {
    final List<Map<String, dynamic>> notifications = [];
    final sorted = List<SignalData>.from(signals)..sort((a, b) => a.isClosed ? 1 : -1);
    
    for (final signal in sorted) {
      if (signal.isClosed) {
        notifications.insert(0, {
          'title': '${signal.symbol} ${signal.strike} ${signal.isProfit ? "Target Achieved" : "Stop Loss Hit"}',
          'desc': signal.isProfit 
              ? 'Option target hit at ₹${signal.exitPrice?.toStringAsFixed(1) ?? signal.entry.toStringAsFixed(1)}. Net profit expansion completed.'
              : 'Stop loss hit at ₹${signal.exitPrice?.toStringAsFixed(1) ?? signal.entry.toStringAsFixed(1)}. Risk management exit.',
          'time': 'Closed',
          'icon': signal.isProfit ? 'check_circle' : 'cancel',
          'iconColor': signal.isProfit ? 'success' : 'error',
        });
      } else {
        notifications.insert(0, {
          'title': 'New Signal Alert: ${signal.symbol}',
          'desc': '${signal.symbol} ${signal.strike} buy alert triggered. Entry ₹${signal.entry.toStringAsFixed(1)}, target ₹${signal.target.toStringAsFixed(1)}.',
          'time': 'Active',
          'icon': 'radar',
          'iconColor': 'primary',
        });
      }
    }
    
    if (notifications.isEmpty) {
      notifications.addAll([
        {
          'title': 'System Active',
          'desc': 'LVX Terminal scanning live feeds...',
          'time': 'Just now',
          'icon': 'radar',
          'iconColor': 'primary',
        }
      ]);
    }
    
    ref.read(notificationsProvider.notifier).state = notifications;
  }

  Future<void> fetchPackages(String baseUrl) async {
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

  Future<void> fetchHomeContent(String baseUrl) async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/api/home-content'));
      if (res.statusCode == 200) {
        final Map<String, dynamic> data = json.decode(res.body);
        ref.read(homeContentProvider.notifier).state = data;
        log('📦 Home content fetched: ${data.keys.length} keys');
      }
    } catch (e) {
      log('❌ Failed to fetch home content: $e');
    }
  }

  Future<void> fetchAiSentiment(String baseUrl) async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/api/v1/ai/sentiment?market=nifty'));
      if (res.statusCode == 200) {
        final decoded = json.decode(res.body);
        if (decoded['success'] == true) {
          ref.read(aiSentimentProvider.notifier).state = decoded['data'];
          log('📦 AI Sentiment fetched: ${decoded['data']?.keys?.length ?? 0} keys');
        }
      }
    } catch (e) {
      log('❌ Failed to fetch AI sentiment: $e');
    }
  }

  Future<void> fetchUserProfile(String baseUrl, String token) async {
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/api/v1/profile/me'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );
      if (res.statusCode == 200) {
        final decoded = json.decode(res.body);
        ref.read(currentUserProvider.notifier).state = decoded;
        log('📦 User profile fetched: ${decoded['name']}');

        // Extract subscription plan and sync with userTierProvider
        final subscription = decoded['subscription'];
        if (subscription != null) {
          final String planName = (subscription['plan'] ?? 'free').toString().toLowerCase();
          final bool isActive = subscription['isActive'] ?? false;
          
          // Check if subscription has expired
          bool isExpired = false;
          final String? endDateStr = subscription['endDate'];
          if (endDateStr != null) {
            try {
              final DateTime endDate = DateTime.parse(endDateStr);
              if (endDate.isBefore(DateTime.now())) {
                isExpired = true;
              }
            } catch (e) {
              log('Error parsing subscription endDate: $e');
            }
          }

          // Determine tier: if active, not expired, and has 'pro', 'gold', 'premium', then 'pro', otherwise 'free'
          String tier = 'free';
          if (isActive && !isExpired && (planName.contains('pro') || planName.contains('gold') || planName.contains('premium'))) {
            tier = 'pro';
          }
          
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('user_plan', tier);
          ref.read(userTierProvider.notifier).state = tier;
          log('📦 Synced User Tier Plan from DB: $tier (planName: $planName, active: $isActive, expired: $isExpired)');
        }
      }
    } catch (e) {
      log('❌ Failed to fetch user profile: $e');
    }
  }

  Future<void> setupFcm(String baseUrl, String authToken) async {
    try {
      final FirebaseMessaging messaging = FirebaseMessaging.instance;
      
      // Request permissions
      final NotificationSettings settings = await messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );
      
      log('🔔 [FCM] Notification authorization status: ${settings.authorizationStatus}');
      
      // Get token
      final String? fcmToken = await messaging.getToken();
      if (fcmToken != null) {
        await syncFcmToken(fcmToken, baseUrl, authToken);
      }
      
      // Listen for token refresh
      messaging.onTokenRefresh.listen((newToken) {
        syncFcmToken(newToken, baseUrl, authToken);
      });
      
      // Handle foreground messaging
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        log('🔔 [FCM] Foreground notification received: ${message.notification?.title}');
      });
    } catch (e) {
      log('❌ [FCM] Error setting up Firebase Cloud Messaging: $e');
    }
  }

  Future<void> syncFcmToken(String fcmToken, String baseUrl, String authToken) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/api/v1/profile/fcm-token'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $authToken',
        },
        body: json.encode({
          'fcmToken': fcmToken,
        }),
      );
      if (res.statusCode == 200) {
        log('✅ [FCM] Token synchronized successfully: $fcmToken');
      } else {
        log('⚠️ [FCM] Failed to sync token: ${res.body}');
      }
    } catch (e) {
      log('❌ [FCM] Sync connection error: $e');
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
      confidence: (json['confidenceScore'] as num?)?.toInt() ?? 90,
      riskLevel: json['rating'] ?? risk,
      time: 'Live Now',
      reasoning: json['aiRationale'] ?? json['rawText'] ?? 'AI confirmation secured.',
      isClosed: isClosed,
      isProfit: isProfit,
      exitPrice: (json['currentPrice'] as num?)?.toDouble() ?? (json['entry'] as num?)?.toDouble() ?? 0.0,
      source: json['source'] ?? 'TELEGRAM',
    );
  }
}
