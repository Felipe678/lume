import 'package:flutter/material.dart';

abstract final class AppPalette {
  static const Color violet = Color(0xFF5B16F0);
  static const Color cyan = Color(0xFF16D4F5);
  static const Color orange = Color(0xFFFF8A00);
  static const Color blue = Color(0xFF2F6BFF);
  static const Color yellow = Color(0xFFE6E23A);
  static const Color green = Color(0xFF34D26E);
  static const Color mint = Color(0xFF4ADE80);
  static const Color purple = Color(0xFFA855F7);
  static const Color red = Color(0xFFFF3B30);

  static const Color badgeRed = Color(0xFFF53B3B);
  static const Color badgeBlue = Color(0xFF1E5BFF);
  static const Color badgeNeutral = Color(0xFF3A3A40);
  static const Color mastercardRed = Color(0xFFEB001B);
  static const Color mastercardYellow = Color(0xFFF79E1B);

  static const Color onCard = Color(0xFF0B0B0C);
  static const Color cardGlow = Color(0xFF2447A8);
  static const Color cardForeground = Color(0xFFFFFFFF);
  static const Color cardBorder = Color(0x14FFFFFF);

  static const LinearGradient brandGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF2A8CFF), Color(0xFF8A3BFF)],
  );

  static const LinearGradient cardGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF060B1A), Color(0xFF0B1636), Color(0xFF12275E), Color(0xFF1C3C86)],
    stops: [0.0, 0.38, 0.72, 1.0],
  );

  static const LinearGradient chipGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFF2F2F2), Color(0xFFBDBDBD)],
  );
}
