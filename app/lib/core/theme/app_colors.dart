import 'package:flutter/material.dart';

/// Cores que mudam entre tema escuro e claro. Valores do `docs/design-system/tokens.json`.
class AppColors extends ThemeExtension<AppColors> {
  final Color bg;
  final Color topbar;
  final Color heroBand;
  final Color surface;
  final Color surfaceRaised;
  final Color surfaceGlass;
  final Color surfaceTint;
  final Color chip;
  final Color iconTile;
  final Color divider;
  final Color hairline;
  final Color hairlineStrong;
  final Color danger;
  final Color onDanger;
  final Color ringTrack;
  final Color barMuted;
  final Color borderControl;
  final Color scrim;
  final Color aurora1;
  final Color aurora2;
  final Color textPrimary;
  final Color textSecondary;
  final Color textMuted;
  final Color violetInk;
  final Color cyanInk;
  final Color orangeInk;
  final Color greenInk;
  final Color blueInk;

  const AppColors._({
    required this.bg,
    required this.topbar,
    required this.heroBand,
    required this.surface,
    required this.surfaceRaised,
    required this.surfaceGlass,
    required this.surfaceTint,
    required this.chip,
    required this.iconTile,
    required this.divider,
    required this.hairline,
    required this.hairlineStrong,
    required this.danger,
    required this.onDanger,
    required this.ringTrack,
    required this.barMuted,
    required this.borderControl,
    required this.scrim,
    required this.aurora1,
    required this.aurora2,
    required this.textPrimary,
    required this.textSecondary,
    required this.textMuted,
    required this.violetInk,
    required this.cyanInk,
    required this.orangeInk,
    required this.greenInk,
    required this.blueInk,
  });

  static const AppColors dark = AppColors._(
    bg: Color(0xFF050506),
    topbar: Color(0xFF000000),
    heroBand: Color(0xFF111114),
    surface: Color(0xFF0C0C0F),
    surfaceRaised: Color(0xFF17171B),
    surfaceGlass: Color(0xCC0C0C0F),
    surfaceTint: Color(0xFF16141F),
    chip: Color(0xFF1E1E22),
    iconTile: Color(0xFF1C1C20),
    divider: Color(0xFF232328),
    hairline: Color(0x0FFFFFFF),
    hairlineStrong: Color(0x1FFFFFFF),
    danger: Color(0xFFFF3B30),
    onDanger: Color(0xFF1A0302),
    ringTrack: Color(0xFF25252A),
    barMuted: Color(0xFF34343A),
    borderControl: Color(0xFF6B6B73),
    scrim: Color(0x99000000),
    aurora1: Color(0x1A5B16F0),
    aurora2: Color(0x0F16D4F5),
    textPrimary: Color(0xFFFFFFFF),
    textSecondary: Color(0xFF9A9AA3),
    textMuted: Color(0xFF8A8A93),
    violetInk: Color(0xFFA98BFF),
    cyanInk: Color(0xFF16D4F5),
    orangeInk: Color(0xFFFF8A00),
    greenInk: Color(0xFF34D26E),
    blueInk: Color(0xFF6E9BFF),
  );

  // Provisório: aguardando o frame do tema claro do design.
  static const AppColors light = AppColors._(
    bg: Color(0xFFF4F4F6),
    topbar: Color(0xFFFFFFFF),
    heroBand: Color(0xFFEAEAEE),
    surface: Color(0xFFFFFFFF),
    surfaceRaised: Color(0xFFF4F4F6),
    surfaceGlass: Color(0xCCFFFFFF),
    surfaceTint: Color(0xFFF1EEFB),
    chip: Color(0xFFE9E9EE),
    iconTile: Color(0xFFEDEDF1),
    divider: Color(0xFFE1E1E6),
    hairline: Color(0x0F0A0A0B),
    hairlineStrong: Color(0x1A0A0A0B),
    danger: Color(0xFFC4231A),
    onDanger: Color(0xFFFFFFFF),
    ringTrack: Color(0xFFE1E1E6),
    barMuted: Color(0xFFD4D4DA),
    borderControl: Color(0xFF8A8A93),
    scrim: Color(0x40000000),
    aurora1: Color(0x0F5B16F0),
    aurora2: Color(0x0A16D4F5),
    textPrimary: Color(0xFF0A0A0B),
    textSecondary: Color(0xFF5C5C66),
    textMuted: Color(0xFF62626C),
    violetInk: Color(0xFF5B16F0),
    cyanInk: Color(0xFF00778F),
    orangeInk: Color(0xFFA85A00),
    greenInk: Color(0xFF117A3B),
    blueInk: Color(0xFF2B64F5),
  );

  static AppColors of(BuildContext context) => Theme.of(context).extension<AppColors>()!;

  @override
  AppColors copyWith({
    Color? bg,
    Color? topbar,
    Color? heroBand,
    Color? surface,
    Color? surfaceRaised,
    Color? surfaceGlass,
    Color? surfaceTint,
    Color? chip,
    Color? iconTile,
    Color? divider,
    Color? hairline,
    Color? hairlineStrong,
    Color? danger,
    Color? onDanger,
    Color? ringTrack,
    Color? barMuted,
    Color? borderControl,
    Color? scrim,
    Color? aurora1,
    Color? aurora2,
    Color? textPrimary,
    Color? textSecondary,
    Color? textMuted,
    Color? violetInk,
    Color? cyanInk,
    Color? orangeInk,
    Color? greenInk,
    Color? blueInk,
  }) {
    return AppColors._(
      bg: bg ?? this.bg,
      topbar: topbar ?? this.topbar,
      heroBand: heroBand ?? this.heroBand,
      surface: surface ?? this.surface,
      surfaceRaised: surfaceRaised ?? this.surfaceRaised,
      surfaceGlass: surfaceGlass ?? this.surfaceGlass,
      surfaceTint: surfaceTint ?? this.surfaceTint,
      chip: chip ?? this.chip,
      iconTile: iconTile ?? this.iconTile,
      divider: divider ?? this.divider,
      hairline: hairline ?? this.hairline,
      hairlineStrong: hairlineStrong ?? this.hairlineStrong,
      danger: danger ?? this.danger,
      onDanger: onDanger ?? this.onDanger,
      ringTrack: ringTrack ?? this.ringTrack,
      barMuted: barMuted ?? this.barMuted,
      borderControl: borderControl ?? this.borderControl,
      scrim: scrim ?? this.scrim,
      aurora1: aurora1 ?? this.aurora1,
      aurora2: aurora2 ?? this.aurora2,
      textPrimary: textPrimary ?? this.textPrimary,
      textSecondary: textSecondary ?? this.textSecondary,
      textMuted: textMuted ?? this.textMuted,
      violetInk: violetInk ?? this.violetInk,
      cyanInk: cyanInk ?? this.cyanInk,
      orangeInk: orangeInk ?? this.orangeInk,
      greenInk: greenInk ?? this.greenInk,
      blueInk: blueInk ?? this.blueInk,
    );
  }

  @override
  AppColors lerp(covariant AppColors? other, double t) {
    if (other == null) return this;
    return AppColors._(
      bg: Color.lerp(bg, other.bg, t)!,
      topbar: Color.lerp(topbar, other.topbar, t)!,
      heroBand: Color.lerp(heroBand, other.heroBand, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      surfaceRaised: Color.lerp(surfaceRaised, other.surfaceRaised, t)!,
      surfaceGlass: Color.lerp(surfaceGlass, other.surfaceGlass, t)!,
      surfaceTint: Color.lerp(surfaceTint, other.surfaceTint, t)!,
      chip: Color.lerp(chip, other.chip, t)!,
      iconTile: Color.lerp(iconTile, other.iconTile, t)!,
      divider: Color.lerp(divider, other.divider, t)!,
      hairline: Color.lerp(hairline, other.hairline, t)!,
      hairlineStrong: Color.lerp(hairlineStrong, other.hairlineStrong, t)!,
      danger: Color.lerp(danger, other.danger, t)!,
      onDanger: Color.lerp(onDanger, other.onDanger, t)!,
      ringTrack: Color.lerp(ringTrack, other.ringTrack, t)!,
      barMuted: Color.lerp(barMuted, other.barMuted, t)!,
      borderControl: Color.lerp(borderControl, other.borderControl, t)!,
      scrim: Color.lerp(scrim, other.scrim, t)!,
      aurora1: Color.lerp(aurora1, other.aurora1, t)!,
      aurora2: Color.lerp(aurora2, other.aurora2, t)!,
      textPrimary: Color.lerp(textPrimary, other.textPrimary, t)!,
      textSecondary: Color.lerp(textSecondary, other.textSecondary, t)!,
      textMuted: Color.lerp(textMuted, other.textMuted, t)!,
      violetInk: Color.lerp(violetInk, other.violetInk, t)!,
      cyanInk: Color.lerp(cyanInk, other.cyanInk, t)!,
      orangeInk: Color.lerp(orangeInk, other.orangeInk, t)!,
      greenInk: Color.lerp(greenInk, other.greenInk, t)!,
      blueInk: Color.lerp(blueInk, other.blueInk, t)!,
    );
  }
}
