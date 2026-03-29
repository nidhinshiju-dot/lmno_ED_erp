import 'package:flutter/material.dart';
import 'clay_theme.dart';
import 'clay_container.dart';

class ClayTimeline extends StatelessWidget {
  final List<TimelineItemData> items;
  final Function(TimelineItemData)? onTap;

  const ClayTimeline({
    Key? key,
    required this.items,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Text(
            'No schedule found for today.',
            style: TextStyle(color: ClayTheme.textLight, fontStyle: FontStyle.italic),
          ),
        ),
      );
    }

    return ListView.builder(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        final isLast = index == items.length - 1;

        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Timeline line and dot
            Column(
              children: [
                ClayContainer(
                  height: 20,
                  width: 20,
                  borderRadius: BorderRadius.circular(10),
                  color: item.isActive ? ClayTheme.primary : ClayTheme.background,
                  depth: true,
                ),
                if (!isLast)
                  Container(
                    width: 2,
                    height: 80, // Approximate height to reach next dot
                    color: ClayTheme.primary.withOpacity(0.2),
                  ),
              ],
            ),
            const SizedBox(width: 16),
            
            // Content Card
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(bottom: 24.0),
                child: GestureDetector(
                  onTap: onTap != null ? () => onTap!(item) : null,
                  child: ClayContainer(
                    depth: true,
                    emboss: false,
                    padding: const EdgeInsets.all(16),
                    borderRadius: BorderRadius.circular(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              item.timeRange,
                              style: TextStyle(
                                color: item.isActive ? ClayTheme.primary : ClayTheme.textLight,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                            if (item.tag != null)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: ClayTheme.primary.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  item.tag!,
                                  style: const TextStyle(fontSize: 10, color: ClayTheme.primary, fontWeight: FontWeight.bold),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          item.title,
                          style: TextStyle(
                            color: ClayTheme.textDark,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        if (item.subtitle != null) ...[
                          const SizedBox(height: 4),
                          Text(
                            item.subtitle!,
                            style: TextStyle(color: ClayTheme.textLight, fontSize: 14),
                          ),
                        ]
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

class TimelineItemData {
  final String id;
  final String timeRange;
  final String title;
  final String? subtitle;
  final String? tag;
  final bool isActive;
  final dynamic payload;

  TimelineItemData({
    required this.id,
    required this.timeRange,
    required this.title,
    this.subtitle,
    this.tag,
    this.isActive = false,
    this.payload,
  });
}
