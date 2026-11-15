import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lume/core/theme/app_palette.dart';

import '../../helpers/tokens_json.dart';

/// Token fixo do DS (kebab-case) -> constante de AppPalette.
const Map<String, Color> _fixed = {
  'violet': AppPalette.violet,
  'on-violet': AppPalette.onViolet,
  'cyan': AppPalette.cyan,
  'on-cyan': AppPalette.onCyan,
  'orange': AppPalette.orange,
  'on-orange': AppPalette.onOrange,
  'ember': AppPalette.ember,
  'green': AppPalette.green,
  'on-green': AppPalette.onGreen,
  'blue': AppPalette.blue,
  'data-yellow': AppPalette.dataYellow,
  'data-mint': AppPalette.dataMint,
  'data-purple': AppPalette.dataPurple,
  'brand-from': AppPalette.brandFrom,
  'brand-to': AppPalette.brandTo,
  'card-1': AppPalette.card1,
  'card-2': AppPalette.card2,
  'card-3': AppPalette.card3,
  'card-4': AppPalette.card4,
  'card-glow': AppPalette.cardGlow,
  'card-fg': AppPalette.cardFg,
  'card-fg-muted': AppPalette.cardFgMuted,
  'card-border': AppPalette.cardBorder,
  'goal-amber': AppPalette.goalAmber,
  'goal-sky': AppPalette.goalSky,
  'goal-emerald': AppPalette.goalEmerald,
  'goal-rose': AppPalette.goalRose,
  'goal-violet': AppPalette.goalViolet,
  'goal-lime': AppPalette.goalLime,
  'goal-cyan': AppPalette.goalCyan,
  'goal-fuchsia': AppPalette.goalFuchsia,
  'goal-obligatory': AppPalette.goalObligatory,
};

void main() {
  final tokens = loadColorTokens();
  final fixedTokens = {
    for (final e in tokens.entries)
      if (!isThemed(e.value)) e.key: e.value,
  };

  group('AppPalette contra o tokens.json', () {
    test('todo token fixo tem constante e vice-versa', () {
      expect(_fixed.keys.toSet().difference(fixedTokens.keys.toSet()), isEmpty,
          reason: 'constante sem token no DS');
      expect(fixedTokens.keys.toSet().difference(_fixed.keys.toSet()), isEmpty,
          reason: 'token fixo do DS sem constante');
    });

    test('valores iguais ao DS (inclui alpha de card-fg-muted e card-border)', () {
      for (final e in fixedTokens.entries) {
        expect(_fixed[e.key], colorOf(e.value), reason: 'token ${e.key}');
      }
    });

    test('brandGradient usa brand-from e brand-to', () {
      expect(AppPalette.brandGradient.colors,
          [AppPalette.brandFrom, AppPalette.brandTo]);
    });

    test('cardGradient usa card-1 a card-4 nas paradas 0, 38, 72 e 100%', () {
      expect(AppPalette.cardGradient.colors, [
        AppPalette.card1,
        AppPalette.card2,
        AppPalette.card3,
        AppPalette.card4,
      ]);
      expect(AppPalette.cardGradient.stops, [0.0, 0.38, 0.72, 1.0]);
    });
  });
}
