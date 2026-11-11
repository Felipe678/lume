import 'package:flutter/material.dart';

class AppColors extends ThemeExtension<AppColors> {
  final Color background;
  final Color topBar;
  final Color heroBand;
  final Color surface;
  final Color surfaceRaised;
  final Color chip;
  final Color iconTile;
  final Color divider;
  final Color textPrimary;
  final Color textSecondary;
  final Color textMuted;
  final Color barMuted;
  final Color ringTrack;

  const AppColors._({
    required this.background,
    required this.topBar,
    required this.heroBand,
    required this.surface,
    required this.surfaceRaised,
    required this.chip,
    required this.iconTile,
    required this.divider,
    required this.textPrimary,
    required this.textSecondary,
    required this.textMuted,
    required this.barMuted,
    required this.ringTrack,
  });

  static const AppColors dark = AppColors._(
    background: Color(0xFF050506),
    topBar: Color(0xFF000000),
    heroBand: Color(0xFF111114),
    surface: Color(0xFF0C0C0F),
    surfaceRaised: Color(0xFF17171B),
    chip: Color(0xFF1E1E22),
    iconTile: Color(0xFF1C1C20),
    divider: Color(0xFF232328),
    textPrimary: Color(0xFFFFFFFF),
    textSecondary: Color(0xFF9A9AA3),
    textMuted: Color(0xFF6B6B73),
    barMuted: Color(0xFF34343A),
    ringTrack: Color(0xFF25252A),
  );

  // Provisório: aguardando o frame do tema claro do design.
  static const AppColors light = AppColors._(
    background: Color(0xFFF4F4F6),
    topBar: Color(0xFFFFFFFF),
    heroBand: Color(0xFFEAEAEE),
    surface: Color(0xFFFFFFFF),
    surfaceRaised: Color(0xFFF4F4F6),
    chip: Color(0xFFE9E9EE),
    iconTile: Color(0xFFEDEDF1),
    divider: Color(0xFFE1E1E6),
    textPrimary: Color(0xFF0A0A0B),
    textSecondary: Color(0xFF5C5C66),
    textMuted: Color(0xFF8A8A93),
    barMuted: Color(0xFFD4D4DA),
    ringTrack: Color(0xFFE1E1E6),
  );

  static AppColors of(BuildContext context) => Theme.of(context).extension<AppColors>()!;

  @override
  AppColors copyWith({
    Color? background,
    Color? topBar,
    Color? heroBand,
    Color? surface,
    Color? surfaceRaised,
    Color? chip,
    Color? iconTile,
    Color? divider,
    Color? textPrimary,
    Color? textSecondary,
    Color? textMuted,
    Color? barMuted,
    Color? ringTrack,
  }) {
    return AppColors._(
      background: background ?? this.background,
      topBar: topBar ?? this.topBar,
      heroBand: heroBand ?? this.heroBand,
      surface: surface ?? this.surface,
      surfaceRaised: surfaceRaised ?? this.surfaceRaised,
      chip: chip ?? this.chip,
      iconTile: iconTile ?? this.iconTile,
      divider: divider ?? this.divider,
      textPrimary: textPrimary ?? this.textPrimary,
      textSecondary: textSecondary ?? this.textSecondary,
      textMuted: textMuted ?? this.textMuted,
      barMuted: barMuted ?? this.barMuted,
      ringTrack: ringTrack ?? this.ringTrack,
    );
  }

  @override
  AppColors lerp(covariant AppColors? other, double t) {
    if (other == null) return this;
    return AppColors._(
      background: Color.lerp(background, other.background, t)!,
      topBar: Color.lerp(topBar, other.topBar, t)!,
      heroBand: Color.lerp(heroBand, other.heroBand, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      surfaceRaised: Color.lerp(surfaceRaised, other.surfaceRaised, t)!,
      chip: Color.lerp(chip, other.chip, t)!,
      iconTile: Color.lerp(iconTile, other.iconTile, t)!,
      divider: Color.lerp(divider, other.divider, t)!,
      textPrimary: Color.lerp(textPrimary, other.textPrimary, t)!,
      textSecondary: Color.lerp(textSecondary, other.textSecondary, t)!,
      textMuted: Color.lerp(textMuted, other.textMuted, t)!,
      barMuted: Color.lerp(barMuted, other.barMuted, t)!,
      ringTrack: Color.lerp(ringTrack, other.ringTrack, t)!,
    );
  }
}
