import 'package:flutter/material.dart';
import 'clay_container.dart';
import 'clay_theme.dart';

class ClayButton extends StatefulWidget {
  final Widget child;
  final VoidCallback? onPressed;
  final bool isLoading;
  final EdgeInsetsGeometry? padding;

  const ClayButton({
    Key? key,
    required this.child,
    required this.onPressed,
    this.isLoading = false,
    this.padding,
  }) : super(key: key);

  @override
  State<ClayButton> createState() => _ClayButtonState();
}

class _ClayButtonState extends State<ClayButton> {
  bool _isPressed = false;

  void _handleTapDown(TapDownDetails details) {
    if (widget.onPressed != null && !widget.isLoading) {
      setState(() => _isPressed = true);
    }
  }

  void _handleTapUp(TapUpDetails details) {
    if (widget.onPressed != null && !widget.isLoading) {
      setState(() => _isPressed = false);
      widget.onPressed!();
    }
  }

  void _handleTapCancel() {
    if (_isPressed) setState(() => _isPressed = false);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: _handleTapDown,
      onTapUp: _handleTapUp,
      onTapCancel: _handleTapCancel,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        child: ClayContainer(
          padding: widget.padding ?? const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
          color: widget.onPressed == null ? Colors.grey.shade300 : ClayTheme.primary,
          emboss: _isPressed,
          depth: !_isPressed,
          borderRadius: BorderRadius.circular(30),
          child: Center(
            child: widget.isLoading 
              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
              : DefaultTextStyle(
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                  child: widget.child,
                ),
          ),
        ),
      ),
    );
  }
}
