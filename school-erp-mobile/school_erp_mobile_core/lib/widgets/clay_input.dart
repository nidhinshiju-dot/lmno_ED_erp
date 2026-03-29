import 'package:flutter/material.dart';
import 'clay_container.dart';
import 'clay_theme.dart';

class ClayInput extends StatelessWidget {
  final TextEditingController? controller;
  final String hintText;
  final IconData? prefixIcon;
  final bool obscureText;
  final String? Function(String?)? validator;

  const ClayInput({
    Key? key,
    this.controller,
    required this.hintText,
    this.prefixIcon,
    this.obscureText = false,
    this.validator,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ClayContainer(
      emboss: true,
      depth: true,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      borderRadius: BorderRadius.circular(12),
      child: TextFormField(
        controller: controller,
        obscureText: obscureText,
        validator: validator,
        style: TextStyle(color: ClayTheme.textDark),
        decoration: InputDecoration(
          border: InputBorder.none,
          hintText: hintText,
          hintStyle: TextStyle(color: ClayTheme.textLight),
          icon: prefixIcon != null ? Icon(prefixIcon, color: ClayTheme.textLight) : null,
        ),
      ),
    );
  }
}
