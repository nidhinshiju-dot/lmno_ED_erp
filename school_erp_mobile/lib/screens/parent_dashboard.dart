import 'dart:convert';
import 'package:flutter/material.dart';
import '../core/api_client.dart';

class ParentDashboard extends StatefulWidget {
  const ParentDashboard({super.key});

  @override
  State<ParentDashboard> createState() => _ParentDashboardState();
}

class _ParentDashboardState extends State<ParentDashboard> {
  List<Map<String, dynamic>> _courses = [];
  List<Map<String, dynamic>> _invoices = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadChildData();
  }

  Future<void> _loadChildData() async {
    try {
      if (!mounted) return;
      // Load child courses and invoices
      final courseRes = await ApiClient.get(context, '/courses');
      final invoiceRes = await ApiClient.get(context, '/invoices');

      if (courseRes.statusCode == 200) {
        _courses = (json.decode(courseRes.body) as List).cast<Map<String, dynamic>>();
      }
      if (invoiceRes.statusCode == 200) {
        _invoices = (json.decode(invoiceRes.body) as List).cast<Map<String, dynamic>>();
      }
    } catch (_) {
      // Graceful failure
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (_isLoading) return const Center(child: CircularProgressIndicator());

    final pendingFees = _invoices.where((i) => i['status'] != 'PAID').length;
    final totalDue = _invoices
        .where((i) => i['status'] != 'PAID')
        .fold<double>(0, (sum, i) => sum + (i['totalAmount'] ?? 0).toDouble());

    return RefreshIndicator(
      onRefresh: _loadChildData,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Welcome Banner
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.teal.shade400, Colors.teal.shade700],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Parent Dashboard 👨‍👩‍👧', style: theme.textTheme.headlineSmall?.copyWith(color: Colors.white, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text('Monitor your child\'s academic progress.', style: theme.textTheme.bodyMedium?.copyWith(color: Colors.white70)),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Stats
          Row(
            children: [
              Expanded(child: _StatCard(icon: Icons.book, label: 'Courses', value: '${_courses.length}', color: Colors.indigo)),
              const SizedBox(width: 12),
              Expanded(child: _StatCard(icon: Icons.receipt, label: 'Pending Fees', value: '$pendingFees', color: Colors.orange)),
              const SizedBox(width: 12),
              Expanded(child: _StatCard(icon: Icons.currency_rupee, label: 'Total Due', value: '₹${totalDue.toInt()}', color: Colors.red)),
            ],
          ),
          const SizedBox(height: 24),

          // Courses
          Text('Child\'s Courses', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          if (_courses.isEmpty)
            Card(child: ListTile(leading: const Icon(Icons.info_outline), title: const Text('No courses enrolled yet.')))
          else
            ..._courses.map((c) => Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: theme.colorScheme.primaryContainer,
                  child: Text((c['code'] ?? 'XX').toString().substring(0, 2).toUpperCase(), style: TextStyle(color: theme.colorScheme.onPrimaryContainer, fontWeight: FontWeight.bold)),
                ),
                title: Text(c['title'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text(c['description'] ?? ''),
              ),
            )),

          const SizedBox(height: 24),

          // Fee Summary
          Text('Fee Summary', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          if (_invoices.isEmpty)
            Card(child: ListTile(leading: const Icon(Icons.info_outline), title: const Text('No fee invoices yet.')))
          else
            ..._invoices.map((inv) {
              final isPaid = inv['status'] == 'PAID';
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: isPaid ? Colors.green.shade50 : Colors.orange.shade50,
                    child: Icon(isPaid ? Icons.check_circle : Icons.pending, color: isPaid ? Colors.green : Colors.orange),
                  ),
                  title: Text('₹${inv['totalAmount'] ?? 0}', style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(inv['dueDate'] ?? 'No due date'),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: isPaid ? Colors.green.shade50 : Colors.orange.shade50,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(isPaid ? 'Paid' : 'Pending', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isPaid ? Colors.green : Colors.orange)),
                  ),
                ),
              );
            }),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({required this.icon, required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 12),
        child: Column(children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
          const SizedBox(height: 4),
          Text(label, style: Theme.of(context).textTheme.bodySmall),
        ]),
      ),
    );
  }
}
