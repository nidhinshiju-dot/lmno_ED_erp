import 'package:flutter/material.dart';
import 'package:school_erp_mobile_core/school_erp_mobile_core.dart';
import 'package:provider/provider.dart';
import 'dart:convert';

class AttendanceTab extends StatefulWidget {
  const AttendanceTab({super.key});

  @override
  State<AttendanceTab> createState() => _AttendanceTabState();
}

class _AttendanceTabState extends State<AttendanceTab> {
  bool _isLoading = true;
  String? _error;
  List<TimelineItemData> _todaySlots = [];

  @override
  void initState() {
    super.initState();
    _loadTimetable();
  }

  Future<void> _loadTimetable() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final res = await ApiClient.get(context, '/timetable/active/teacher/${auth.user?['staffId'] ?? 'me'}');
      
      if (res.statusCode == 200) {
        final List<dynamic> data = json.decode(res.body);
        if (mounted) {
          setState(() {
            _todaySlots = data.map((slot) {
              return TimelineItemData(
                id: slot['id'] ?? '',
                timeRange: '${slot['startTime']} - ${slot['endTime']}',
                title: '${slot['subjectName']} (${slot['className']})',
                subtitle: 'Room: ${slot['roomName']}',
                tag: 'Class',
                isActive: true,
                payload: slot,
              );
            }).toList();
            _isLoading = false;
          });
        }
      } else {
        if (mounted) setState(() { _error = 'Failed to load teacher timetable.'; _isLoading = false; });
      }
    } catch (_) {
      if (mounted) setState(() { _error = 'Network connection lost.'; _isLoading = false; });
    }
  }

  void _onSlotTapped(TimelineItemData slot) {
    if (slot.title.contains("Free")) return;
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _AttendanceActionSheet(slot: slot),
    );
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0),
            child: ClayContainer(
              depth: false,
              emboss: true,
              color: ClayTheme.background,
              borderRadius: BorderRadius.circular(12),
              padding: EdgeInsets.zero,
              child: TabBar(
                indicator: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  color: ClayTheme.primary.withOpacity(0.1),
                ),
                labelColor: ClayTheme.primary,
                unselectedLabelColor: ClayTheme.textLight,
                tabs: const [
                  Tab(text: "Today's Schedule"),
                  Tab(text: "Weekly View"),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: TabBarView(
              children: [
                // Today Tab
                Builder(
                  builder: (context) {
                    if (_isLoading) return const Center(child: CircularProgressIndicator());
                    if (_error != null) return ClayErrorState(message: _error!, onRetry: _loadTimetable);
                    if (_todaySlots.isEmpty) return const ClayEmptyState(title: 'Rest Day!', message: "You have no scheduled classes for today.", icon: Icons.weekend);
                    
                    return SingleChildScrollView(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Select a period to mark attendance:', style: TextStyle(color: ClayTheme.textLight)),
                          const SizedBox(height: 24),
                          ClayTimeline(
                            items: _todaySlots,
                            onTap: _onSlotTapped,
                          ),
                        ],
                      ),
                    );
                  }
                ),
                // Weekly Tab
                const ClayEmptyState(title: "Weekly Timeline", message: "Graphical weekly timeline matrix is coming in a future update.", icon: Icons.schema),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _AttendanceActionSheet extends StatelessWidget {
  final TimelineItemData slot;

  const _AttendanceActionSheet({required this.slot});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: ClayTheme.background,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(slot.title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: ClayTheme.textDark)),
          const SizedBox(height: 4),
          Text('${slot.timeRange} • ${slot.subtitle}', style: const TextStyle(color: ClayTheme.textLight)),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: ClayButton(
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Opening roster for ${slot.title}...'), backgroundColor: ClayTheme.primary));
              },
              child: const Text('Mark Attendance Now'),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ClayButton(
              onPressed: () => Navigator.pop(context),
              color: Colors.grey.shade300,
              child: const Text('Cancel', style: TextStyle(color: ClayTheme.textDark)),
            ),
          )
        ],
      ),
    );
  }
}
