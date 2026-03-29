import 'package:flutter/material.dart';
import 'clay_container.dart';
import 'clay_theme.dart';

class ClayBottomNav extends StatelessWidget {
  final int selectedIndex;
  final Function(int) onItemSelected;
  final List<BottomNavigationBarItem> items;

  const ClayBottomNav({
    Key? key,
    required this.selectedIndex,
    required this.onItemSelected,
    required this.items,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.transparent,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: SafeArea(
        child: ClayContainer(
          borderRadius: BorderRadius.circular(40),
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(items.length, (index) {
              final isSelected = index == selectedIndex;
              final item = items[index];
              return GestureDetector(
                onTap: () => onItemSelected(index),
                child: ClayContainer(
                  depth: isSelected,
                  emboss: isSelected,
                  borderRadius: BorderRadius.circular(30),
                  color: isSelected ? ClayTheme.primary.withOpacity(0.1) : Colors.transparent,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  child: Row(
                    children: [
                      Icon(
                        isSelected ? item.activeIcon?.icon ?? item.icon.icon : item.icon.icon,
                        color: isSelected ? ClayTheme.primary : ClayTheme.textLight,
                      ),
                      if (isSelected) const SizedBox(width: 8),
                      if (isSelected && item.label != null)
                        Text(
                          item.label!,
                          style: TextStyle(
                            color: ClayTheme.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                    ],
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}

extension IconX on Widget {
  IconData? get icon {
    if (this is Icon) return (this as Icon).icon;
    return null;
  }
}
