import 'package:flutter/material.dart';
import 'package:school_erp_mobile_core/school_erp_mobile_core.dart';
import 'dart:convert';

class FeesTab extends StatefulWidget {
  const FeesTab({super.key});

  @override
  State<FeesTab> createState() => _FeesTabState();
}

class _FeesTabState extends State<FeesTab> {
  List<Map<String, dynamic>> _invoices = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadInvoices();
  }

  Future<void> _loadInvoices() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final res = await ApiClient.get(context, '/invoices');
      if (res.statusCode == 200) {
        if (mounted) {
          setState(() {
            _invoices = (json.decode(res.body) as List).cast<Map<String, dynamic>>();
            _isLoading = false;
          });
        }
      } else {
        if (mounted) setState(() { _error = 'Failed to fetch invoices.'; _isLoading = false; });
      }
    } catch (_) {
      if (mounted) setState(() { _error = 'Network connection lost.'; _isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    if (_error != null) return ClayErrorState(message: _error!, onRetry: _loadInvoices);

    final totalPaid = _invoices
        .where((i) => i['status'] == 'PAID')
        .fold<double>(0, (sum, i) => sum + (i['totalAmount'] ?? 0).toDouble());
    final totalPending = _invoices
        .where((i) => i['status'] != 'PAID')
        .fold<double>(0, (sum, i) => sum + (i['totalAmount'] ?? 0).toDouble());

    return RefreshIndicator(
      onRefresh: _loadInvoices,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Summary Header
          ClayContainer(
            padding: const EdgeInsets.all(24),
            borderRadius: BorderRadius.circular(20),
            color: ClayTheme.primary,
            depth: true,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Fee Summary', style: TextStyle(color: Colors.white70, fontSize: 16)),
                const SizedBox(height: 8),
                Text('₹${(totalPaid + totalPending).toStringAsFixed(0)}', style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Paid Amount', style: TextStyle(color: Colors.white70, fontSize: 12)),
                        Text('₹${totalPaid.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        const Text('Pending Dues', style: TextStyle(color: Colors.white70, fontSize: 12)),
                        Text('₹${totalPending.toStringAsFixed(0)}', style: const TextStyle(color: Colors.orangeAccent, fontWeight: FontWeight.bold, fontSize: 16)),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),

          // Payment CTA
          if (totalPending > 0)
            ClayContainer(
              padding: const EdgeInsets.all(20),
              color: Colors.white,
              depth: true,
              borderRadius: BorderRadius.circular(16),
              child: Column(
                children: [
                  const Icon(Icons.payment, size: 40, color: ClayTheme.primary),
                  const SizedBox(height: 12),
                  const Text('Online Payment Coming Soon', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
                  const SizedBox(height: 8),
                  const Text('We are currently setting up our payment gateways. Please pay at the school counter.', textAlign: TextAlign.center, style: TextStyle(color: ClayTheme.textLight, fontSize: 13)),
                  const SizedBox(height: 16),
                  ClayButton(
                    onPressed: null, // Disabled
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    child: Text('Pay ₹$totalPending Offline'),
                  )
                ],
              ),
            ),

          const SizedBox(height: 32),
          const Text('Invoice History', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: ClayTheme.textDark)),
          const SizedBox(height: 16),

          if (_invoices.isEmpty)
            const ClayEmptyState(title: "No Dues", message: "You have no generated fee invoices at this time.", icon: Icons.receipt_long),

          // Invoice List
          ..._invoices.map((inv) {
            final isPaid = inv['status'] == 'PAID';
            return Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: ClayContainer(
                depth: true,
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    ClayContainer(
                      depth: true,
                      emboss: true,
                      borderRadius: BorderRadius.circular(12),
                      padding: const EdgeInsets.all(12),
                      color: isPaid ? ClayTheme.success.withOpacity(0.1) : ClayTheme.warning.withOpacity(0.1),
                      child: Icon(
                        isPaid ? Icons.check_circle : Icons.pending_actions,
                        color: isPaid ? ClayTheme.success : ClayTheme.warning,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Invoice #${inv['id']?.toString().substring(0, 8) ?? 'N/A'}', style: const TextStyle(fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
                          const SizedBox(height: 4),
                          Text('Due: ${inv['dueDate'] ?? 'No Due Date'}', style: const TextStyle(fontSize: 12, color: ClayTheme.textLight)),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text('₹${inv['totalAmount']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: ClayTheme.textDark)),
                        const SizedBox(height: 6),
                        ClayStatusChip(
                          label: isPaid ? 'PAID' : 'PENDING',
                          color: isPaid ? ClayTheme.success : ClayTheme.warning,
                        ),
                      ],
                    )
                  ],
                ),
              ),
            );
          }).toList(),
        ],
      ),
    );
  }
}
