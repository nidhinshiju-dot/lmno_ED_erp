import 'package:flutter/material.dart';
import 'clay_theme.dart';

class ClayContainer extends StatelessWidget {
  final Widget? child;
  final double? height;
  final double? width;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final BorderRadius? borderRadius;
  final Color? color;
  final bool depth;
  final bool emboss; // Whether it's inset (pressed) or outset (raised)
  final BoxShape shape;

  const ClayContainer({
    Key? key,
    this.child,
    this.height,
    this.width,
    this.padding,
    this.margin,
    this.borderRadius,
    this.color,
    this.depth = true,
    this.emboss = false,
    this.shape = BoxShape.rectangle,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final baseColor = color ?? ClayTheme.background;
    
    // For a true inset shadow in pure Flutter without external packages, we use a simple visual trick:
    // Outer shadow for raised, Inner shadow trick via gradient or border for embossed.
    
    final lightColor = Colors.white.withOpacity(0.9);
    final darkColor = Colors.black.withOpacity(0.15);
    final isCircle = shape == BoxShape.circle;

    return Container(
      height: height,
      width: width,
      margin: margin,
      padding: padding ?? (child != null ? const EdgeInsets.all(16) : null),
      decoration: BoxDecoration(
        color: baseColor,
        shape: shape,
        borderRadius: isCircle ? null : (borderRadius ?? BorderRadius.circular(16)),
        boxShadow: depth && !emboss
            ? [
                BoxShadow(
                  color: darkColor,
                  offset: const Offset(6, 6),
                  blurRadius: 12,
                  spreadRadius: 1,
                ),
                BoxShadow(
                  color: lightColor,
                  offset: const Offset(-6, -6),
                  blurRadius: 12,
                  spreadRadius: 1,
                ),
              ]
            : null,
      ),
      child: Stack(
        children: [
          if (emboss && depth)
            Positioned.fill(
              child: ClipPath(
                clipper: _InnerShadowClipper(
                  shape: shape,
                  borderRadius: borderRadius ?? BorderRadius.circular(16),
                ),
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: isCircle ? null : (borderRadius ?? BorderRadius.circular(16)),
                    shape: shape,
                    boxShadow: [
                      BoxShadow(color: darkColor, offset: const Offset(4, 4), blurRadius: 8, spreadRadius: -2),
                      BoxShadow(color: lightColor, offset: const Offset(-4, -4), blurRadius: 8, spreadRadius: -2),
                    ],
                  ),
                ),
              ),
            ),
          if (child != null) 
            Positioned.fill(
              child: Align(
                alignment: Alignment.center,
                child: child!,
              ),
            ),
        ],
      ),
    );
  }
}

class _InnerShadowClipper extends CustomClipper<Path> {
  final BoxShape shape;
  final BorderRadius borderRadius;

  _InnerShadowClipper({required this.shape, required this.borderRadius});

  @override
  Path getClip(Size size) {
    final path = Path();
    path.addRect(Rect.fromLTRB(-50, -50, size.width + 50, size.height + 50));
    final innerPath = Path();
    if (shape == BoxShape.circle) {
      innerPath.addOval(Rect.fromLTWH(0, 0, size.width, size.height));
    } else {
      innerPath.addRRect(RRect.fromRectAndCorners(
        Rect.fromLTWH(0, 0, size.width, size.height),
        topLeft: borderRadius.topLeft,
        topRight: borderRadius.topRight,
        bottomLeft: borderRadius.bottomLeft,
        bottomRight: borderRadius.bottomRight,
      ));
    }
    return Path.combine(PathOperation.difference, path, innerPath);
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => true;
}
