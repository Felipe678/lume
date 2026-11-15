import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lume/core/theme/app_colors.dart';

import '../../helpers/tokens_json.dart';

/// Token do DS (kebab-case) -> campo de AppColors, por tema.
Map<String, Color Function(AppColors)> _fields() => {
      'bg': (c) => c.bg,
      'topbar': (c) => c.topbar,
      'hero-band': (c) => c.heroBand,
      'surface': (c) => c.surface,
      'surface-raised': (c) => c.surfaceRaised,
      'surface-glass': (c) => c.surfaceGlass,
      'surface-tint': (c) => c.surfaceTint,
      'chip': (c) => c.chip,
      'icon-tile': (c) => c.iconTile,
      'divider': (c) => c.divider,
      'hairline': (c) => c.hairline,
      'hairline-strong': (c) => c.hairlineStrong,
      'danger': (c) => c.danger,
      'on-danger': (c) => c.onDanger,
      'ring-track': (c) => c.ringTrack,
      'bar-muted': (c) => c.barMuted,
      'border-control': (c) => c.borderControl,
      'scrim': (c) => c.scrim,
      'aurora-1': (c) => c.aurora1,
      'aurora-2': (c) => c.aurora2,
      'text-primary': (c) => c.textPrimary,
      'text-secondary': (c) => c.textSecondary,
      'text-muted': (c) => c.textMuted,
      'violet-ink': (c) => c.violetInk,
      'cyan-ink': (c) => c.cyanInk,
      'orange-ink': (c) => c.orangeInk,
      'green-ink': (c) => c.greenInk,
      'blue-ink': (c) => c.blueInk,
    };

void main() {
  group('parser de hex', () {
    test('#RRGGBB vira opaco', () {
      expect(parseHex('#050506'), const Color(0xFF050506));
    });

    test('#RRGGBBAA move o alpha para o início', () {
      expect(parseHex('#00000099'), const Color(0x99000000)); // scrim
      expect(parseHex('#ffffff0f'), const Color(0x0FFFFFFF)); // hairline
      expect(parseHex('#ffffffb8'), const Color(0xB8FFFFFF));
    });

    test('hex inválido falha com mensagem', () {
      expect(() => parseHex('#12345'), throwsFormatException);
    });

    test('aceita String e Map {dark, light}', () {
      expect(colorOf('#ff8a00'), const Color(0xFFFF8A00));
      const themed = {'dark': '#000000', 'light': '#ffffff'};
      expect(colorOf(themed, theme: 'dark'), const Color(0xFF000000));
      expect(colorOf(themed, theme: 'light'), const Color(0xFFFFFFFF));
    });
  });

  group('AppColors contra o tokens.json', () {
    final tokens = loadColorTokens();
    final themed = {
      for (final e in tokens.entries)
        if (isThemed(e.value)) e.key: e.value,
    };
    final fields = _fields();

    test('28 tokens temáticos e 28 campos, nos dois sentidos', () {
      expect(themed.length, 28);
      expect(fields.length, 28);
      expect(fields.keys.toSet().difference(themed.keys.toSet()), isEmpty,
          reason: 'campo sem token no DS');
      expect(themed.keys.toSet().difference(fields.keys.toSet()), isEmpty,
          reason: 'token do DS sem campo');
    });

    for (final theme in ['dark', 'light']) {
      final colors = theme == 'dark' ? AppColors.dark : AppColors.light;
      test('tema $theme igual ao DS em todos os campos', () {
        for (final e in themed.entries) {
          expect(fields[e.key]!(colors), colorOf(e.value, theme: theme),
              reason: 'token ${e.key} ($theme)');
        }
      });
    }
  });

  group('AppColors ThemeExtension', () {
    test('copyWith() sem argumentos é igual ao original em todos os campos', () {
      for (final c in [AppColors.dark, AppColors.light]) {
        final copy = c.copyWith();
        for (final e in _fields().entries) {
          expect(e.value(copy), e.value(c), reason: e.key);
        }
      }
    });

    test('copyWith troca só o campo informado', () {
      final copy = AppColors.dark.copyWith(bg: const Color(0xFF123456));
      expect(copy.bg, const Color(0xFF123456));
      expect(copy.surface, AppColors.dark.surface);
    });

    test('lerp(other, 0) é this e lerp(other, 1) é other em todos os campos', () {
      final at0 = AppColors.dark.lerp(AppColors.light, 0);
      final at1 = AppColors.dark.lerp(AppColors.light, 1);
      for (final e in _fields().entries) {
        expect(e.value(at0), e.value(AppColors.dark), reason: '${e.key} t=0');
        expect(e.value(at1), e.value(AppColors.light), reason: '${e.key} t=1');
      }
    });

    test('lerp com null devolve this', () {
      expect(identical(AppColors.dark.lerp(null, 0.5), AppColors.dark), isTrue);
    });
  });
}
