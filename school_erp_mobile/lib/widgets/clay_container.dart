import 'package:flutter/material.dart';

class ClayContainer extends StatelessWidget {
  final Widget child;
  final double? height;
  final double? width;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final BorderRadius? borderRadius;
  final Color? color;
  final bool depth;

  const ClayContainer({
    Key? key,
    required this.child,
    this.height,
    this.width,
    this.padding,
    this.margin,
    this.borderRadius,
    this.color,
    this.depth = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final baseColor = color ?? Theme.of(context).cardColor;
    
    return Container(
      height: height,
      width: width,
      margin: margin,
      padding: padding ?? const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: baseColor,
        borderRadius: borderRadius ?? BorderRadius.circular(16),
        boxShadow: depth ? [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            offset: const Offset(4, 4),
            blurRadius: 10,
            spreadRadius: 1,
          ),
          BoxShadow(
            color: Colors.white.withOpacity(0.8),
            offset: const Offset(-4, -4),
            blurRadius: 10,
            spreadRadius: 1,
          ),
          // Simulating inner shadow with inset approach
          BoxShadow(
            color: baseColor, // Hides the inner part to simulate inset
            offset: const Offset(0, 0),
            blurRadius: 0,
            spreadRadius: 0,
          ),
        ] : [],
      ),
      child: child,
    );
  }
}
