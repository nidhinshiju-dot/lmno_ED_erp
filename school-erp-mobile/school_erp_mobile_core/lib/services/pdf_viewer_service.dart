import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../widgets/clay_theme.dart';

class PdfViewerService {
  /// Launches a remote PDF pre-signed URL in the system's default browser.
  static Future<void> launchRemotePdf(BuildContext context, String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Invalid PDF link received.'), backgroundColor: ClayTheme.danger),
        );
      }
      return;
    }

    try {
      final canLaunch = await canLaunchUrl(uri);
      if (!canLaunch) {
        if (context.mounted) {
           ScaffoldMessenger.of(context).showSnackBar(
             const SnackBar(content: Text('Your device cannot open this link.'), backgroundColor: ClayTheme.danger),
           );
        }
        return;
      }

      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to open PDF: $e'), backgroundColor: ClayTheme.danger),
        );
      }
    }
  }
}
