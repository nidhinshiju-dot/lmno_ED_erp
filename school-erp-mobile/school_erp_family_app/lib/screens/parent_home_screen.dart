import 'dart:convert';
import 'package:flutter/material.dart';
import '../core/api_client.dart';

class ParentHomeScreen extends StatefulWidget {
  const ParentHomeScreen({super.key});

  @override
  State<ParentHomeScreen> createState() => _ParentHomeScreenState();
}

class _ParentHomeScreenState extends State<ParentHomeScreen> {
  List<Map<String, dynamic>> _children = [];
  int _selectedChildIndex = 0;
  List<Map<String, dynamic>> _courses = [];
  List<Map<String, dynamic>> _invoices = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadChildren();
  }

  Future<void> _loadChildren() async {
    try {
      if (!mounted) return;
      // Demo: load all students as potential children for the parent
      final res = await ApiClient.get(context, '/students');
      if (res.statusCode == 200) {
        _children = (json.decode(res.body) as List).cast<Map<String, dynamic>>();
      }
      if (_children.isNotEmpty) {
        await _loadChildData(0);
      }
    } catch (_) {}
    if (mounted) setState(() => _isLoading = false);
  }

  Future<void> _loadChildData(int index) async {
    setState(() { _selectedChildIndex = index; _isLoading = true; });
    try {
      if (!mounted) return;
      final courseRes = await ApiClient.get(context, '/courses');
      final invoiceRes = await ApiClient.get(context, '/invoices');
      if (courseRes.statusCode == 200) {
        _courses = (json.decode(courseRes.body) as List).cast<Map<String, dynamic>>();
      }
      if (invoiceRes.statusCode == 200) {
        _invoices = (json.decode(invoiceRes.body) as List).cast<Map<String, dynamic>>();
      }
    } catch (_) {}
    if (mounted) setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final selectedChild = _children.isNotEmpty ? _children[_selectedChildIndex] : null;

    final pendingFees = _invoices.where((i) => i['status'] != 'PAID').length;
    final totalDue = _invoices
        .where((i) => i['status'] != 'PAID')
        .fold<double>(0, (sum, i) => sum + (i['totalAmount'] ?? 0).toDouble());

    return Scaffold(
      appBar: AppBar(
        title: const Text('Parent Dashboard'),
        centerTitle: true,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadChildren,
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  // Child Selector
                  if (_children.length > 1)
                    Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.primaryContainer.withValues(alpha: 0.3),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: DropdownButton<int>(
                        value: _selectedChildIndex,
                        isExpanded: true,
                        underline: const SizedBox(),
                        icon: const Icon(Icons.swap_vert),
                        items: _children.asMap().entries.map((e) {
                          return DropdownMenuItem<int>(
                            value: e.key,
                            child: Row(
                              children: [
                                const Icon(Icons.child_care, size: 20),
                                const SizedBox(width: 8),
                                Text(e.value['name'] ?? 'Child ${e.key + 1}', style: const TextStyle(fontWeight: FontWeight.bold)),
                                Text(' — ${e.value['admissionNumber'] ?? ''}', style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                              ],
                            ),
                          );
                        }).toList(),
                        onChanged: (v) { if (v != null) _loadChildData(v); },
                      ),
                    ),

                  // Welcome Banner
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Colors.teal.shade400, Colors.teal.shade700],
                        begin: Alignment.topLeft, end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('👨‍👩‍👧 Parent Portal', style: theme.textTheme.headlineSmall?.copyWith(color: Colors.white, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Text(selectedChild != null ? 'Viewing: ${selectedChild['name']}' : 'No children linked',
                          style: theme.textTheme.bodyMedium?.copyWith(color: Colors.white70)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Stats
                  Row(
                    children: [
                      Expanded(child: _SmallCard(icon: Icons.book, label: 'Courses', value: '${_courses.length}', color: Colors.indigo)),
                      const SizedBox(width: 12),
                      Expanded(child: _SmallCard(icon: Icons.receipt, label: 'Pending', value: '$pendingFees', color: Colors.orange)),
                      const SizedBox(width: 12),
                      Expanded(child: _SmallCard(icon: Icons.currency_rupee, label: 'Due', value: '₹${totalDue.toInt()}', color: Colors.red)),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Courses
                  Text('Courses', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  if (_courses.isEmpty)
                    const Card(child: ListTile(leading: Icon(Icons.info_outline), title: Text('No courses yet.')))
                  else
                    ..._courses.map((c) => Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: CircleAvatar(backgroundColor: theme.colorScheme.primaryContainer, child: Text((c['code'] ?? 'XX').toString().substring(0, 2).toUpperCase())),
                        title: Text(c['title'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text(c['description'] ?? ''),
                      ),
                    )),

                  const SizedBox(height: 24),

                  // Fees
                  Text('Fee Summary', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  if (_invoices.isEmpty)
                    const Card(child: ListTile(leading: Icon(Icons.info_outline), title: Text('No invoices yet.')))
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
            ),
    );
  }
}

class _SmallCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _SmallCard({required this.icon, required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
        child: Column(children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 6),
          Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: color)),
          const SizedBox(height: 2),
          Text(label, style: Theme.of(context).textTheme.bodySmall),
        ]),
      ),
    );
  }
}
