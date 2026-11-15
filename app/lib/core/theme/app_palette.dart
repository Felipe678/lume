import 'package:flutter/material.dart';

/// Cores fixas (iguais nos dois temas). Valores do `docs/design-system/tokens.json`.
abstract final class AppPalette {
  // Marca e preenchimentos.
  static const Color violet = Color(0xFF5B16F0);
  static const Color onViolet = Color(0xFFFFFFFF);
  static const Color cyan = Color(0xFF16D4F5);
  static const Color onCyan = Color(0xFF04222A);
  static const Color orange = Color(0xFFFF8A00);
  static const Color onOrange = Color(0xFF1A0F00);
  static const Color ember = Color(0xFFFFB454);
  static const Color green = Color(0xFF34D26E);
  static const Color onGreen = Color(0xFF04210F);
  static const Color blue = Color(0xFF2B64F5);

  // Dados.
  static const Color dataYellow = Color(0xFFE6E23A);
  static const Color dataMint = Color(0xFF4ADE80);
  static const Color dataPurple = Color(0xFFA855F7);

  // Logo.
  static const Color brandFrom = Color(0xFF2A8CFF);
  static const Color brandTo = Color(0xFF8A3BFF);

  static const LinearGradient brandGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [brandFrom, brandTo],
  );

  // Cartão deep navy.
  static const Color card1 = Color(0xFF060B1A);
  static const Color card2 = Color(0xFF0B1636);
  static const Color card3 = Color(0xFF12275E);
  static const Color card4 = Color(0xFF1C3C86);
  static const Color cardGlow = Color(0xFF2447A8);
  static const Color cardFg = Color(0xFFFFFFFF);
  static const Color cardFgMuted = Color(0xB8FFFFFF);
  static const Color cardBorder = Color(0x14FFFFFF);

  static const LinearGradient cardGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [card1, card2, card3, card4],
    stops: [0.0, 0.38, 0.72, 1.0],
  );

  // Objetivos.
  static const Color goalAmber = Color(0xFFF59E0B);
  static const Color goalSky = Color(0xFF0EA5E9);
  static const Color goalEmerald = Color(0xFF10B981);
  static const Color goalRose = Color(0xFFF43F5E);
  static const Color goalViolet = Color(0xFF8B5CF6);
  static const Color goalLime = Color(0xFF84CC16);
  static const Color goalCyan = Color(0xFF06B6D4);
  static const Color goalFuchsia = Color(0xFFD946EF);
  static const Color goalObligatory = Color(0xFF78716C);

  // Sem token no DS (pendência).
  static const Color badgeRed = Color(0xFFF53B3B);
  static const Color badgeBlue = Color(0xFF1E5BFF);
  static const Color badgeNeutral = Color(0xFF3A3A40);
  static const Color mastercardRed = Color(0xFFEB001B);
  static const Color mastercardYellow = Color(0xFFF79E1B);
  static const Color appleIconOnWhite = Color(0xFF0B0B0C);
  static const Color cardChipBorder = Color(0xFFA8A8A8);
  static const Color cardChipLine = Color(0xFF9A9A9A);

  static const LinearGradient chipGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFF2F2F2), Color(0xFFBDBDBD)],
  );
}
