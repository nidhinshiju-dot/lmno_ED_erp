import 'package:flutter/foundation.dart';

class TelemetryService {
  // Singleton pattern for global access
  static final TelemetryService _instance = TelemetryService._internal();
  factory TelemetryService() => _instance;
  TelemetryService._internal();

  /// Logs a telemetry event locally. 
  /// In the future, this abstraction will trigger a POST request to 
  /// `/api/v1/telemetry/events` when the backend analytics controller is built.
  void logEvent(String eventName, {Map<String, dynamic>? properties}) {
    if (kDebugMode) {
      final timestamp = DateTime.now().toIso8601String();
      final propsString = properties != null ? ' | Props: $properties' : '';
      debugPrint('[TELEMETRY] [$timestamp] Event: $eventName $propsString');
    }
    // TODO: Phase 4 Backend Integration
    // Send payload asynchronously without blocking the UI.
    // final payload = {'event': eventName, 'properties': properties, 'timestamp': timestamp};
    // ApiClient.post(context, '/telemetry/events', payload).catchError((_) {});
  }

  void logScreenView(String screenName) {
    logEvent('SCREEN_VIEW', properties: {'screen': screenName});
  }

  void logError(String errorContext, dynamic exception) {
    logEvent('ERROR', properties: {'context': errorContext, 'exception': exception.toString()});
  }
}

// Global instance getter
final telemetry = TelemetryService();
