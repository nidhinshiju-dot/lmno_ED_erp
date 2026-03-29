import 'package:flutter/material.dart';
import 'clay_container.dart';

class ClayStatusChip extends StatelessWidget {
  final String label;
  final Color color;

  const ClayStatusChip({
    Key? key,
    required this.label,
    required this.color,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ClayContainer(
      depth: true,
      emboss: false,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      borderRadius: BorderRadius.circular(20),
      color: color.withOpacity(0.15),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
      ),
    );
  }
}
