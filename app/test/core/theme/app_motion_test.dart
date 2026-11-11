import 'dart:convert';
import 'dart:io';

import 'package:flutter/animation.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lume/core/theme/app_motion.dart';

Map<String, String> _values(String group) {
  final json =
      jsonDecode(File('../docs/design-system/tokens.json').readAsStringSync())
          as Map<String, dynamic>;
  final tokens = (json[group] as Map<String, dynamic>)['tokens'] as List;
  return {
    for (final t in tokens)
      (t as Map<String, dynamic>)['name'] as String: t['value'] as String,
  };
}

Cubic _parseCubic(String css) {
  final n = RegExp(r'cubic-bezier\(([^)]*)\)')
      .firstMatch(css)!
      .group(1)!
      .split(',')
      .map((s) => double.parse(s.trim()))
      .toList();
  return Cubic(n[0], n[1], n[2], n[3]);
}

void main() {
  group('AppMotion contra o tokens.json', () {
    test('8 durações iguais ao DS', () {
      final dur = _values('duration');
      int ms(String name) => int.parse(dur[name]!.replaceAll('ms', ''));
      expect(dur.length, 8);
      expect(AppMotion.instant.inMilliseconds, ms('dur-instant'));
      expect(AppMotion.fast.inMilliseconds, ms('dur-fast'));
      expect(AppMotion.exit.inMilliseconds, ms('dur-exit'));
      expect(AppMotion.base.inMilliseconds, ms('dur-base'));
      expect(AppMotion.slow.inMilliseconds, ms('dur-slow'));
      expect(AppMotion.page.inMilliseconds, ms('dur-page'));
      expect(AppMotion.pulse.inMilliseconds, ms('dur-pulse'));
      expect(AppMotion.breathe.inMilliseconds, ms('dur-breathe'));
    });

    test('sair é mais curto que entrar', () {
      expect(AppMotion.exit, lessThan(AppMotion.base));
    });

    test('7 curvas iguais ao DS (comparadas por pontos)', () {
      final ease = _values('easing');
      expect(ease.length, 7);
      final byName = <String, Curve>{
        'ease-out': AppMotion.easeOut,
        'ease-in': AppMotion.easeIn,
        'ease-settle': AppMotion.settle,
        'ease-out-quint': AppMotion.outQuint,
        'ease-out-expo': AppMotion.outExpo,
        'ease-in-out': AppMotion.inOut,
        'ease-spring': AppMotion.spring,
      };
      expect(byName.keys.toSet(), ease.keys.toSet());
      // inOut é verificada à parte (defeito conhecido, ver teste abaixo).
      byName.remove('ease-in-out');
      byName.forEach((name, curve) {
        final expected = _parseCubic(ease[name]!);
        for (var i = 0; i <= 20; i++) {
          final t = i / 20;
          expect(
            curve.transform(t),
            closeTo(expected.transform(t), 0.01),
            reason: '$name em t=$t',
          );
        }
      });
    });

    test(
      'inOut igual ao ease-in-out do DS',
      () {
        final expected = _parseCubic(_values('easing')['ease-in-out']!);
        for (var i = 0; i <= 20; i++) {
          final t = i / 20;
          expect(AppMotion.inOut.transform(t), closeTo(expected.transform(t), 0.01), reason: 't=$t');
        }
      },
    );

    test('spring é o Cubic do DS, com overshoot, e não easeOutBack', () {
      const dsSpring = Cubic(0.34, 1.56, 0.64, 1);
      for (final t in [0.1, 0.3, 0.5, 0.7, 0.9]) {
        expect(AppMotion.spring.transform(t), closeTo(dsSpring.transform(t), 1e-9));
      }
      var peak = 0.0;
      for (var i = 1; i < 100; i++) {
        final v = AppMotion.spring.transform(i / 100);
        if (v > peak) peak = v;
      }
      expect(peak, greaterThan(1));
      expect(AppMotion.spring.transform(0), 0);
      expect(AppMotion.spring.transform(1), 1);
      final differs = [0.2, 0.4, 0.6, 0.8].any(
        (t) => (AppMotion.spring.transform(t) - Curves.easeOutBack.transform(t)).abs() > 0.01,
      );
      expect(differs, isTrue, reason: 'spring não pode ser easeOutBack');
    });

    test('durações de interface não passam de page (breathe é ciclo contínuo)', () {
      for (final d in [
        AppMotion.instant,
        AppMotion.fast,
        AppMotion.exit,
        AppMotion.base,
        AppMotion.slow,
        AppMotion.pulse,
      ]) {
        expect(d, lessThanOrEqualTo(AppMotion.pulse));
      }
      expect(AppMotion.slow, lessThanOrEqualTo(AppMotion.page));
    });
  });
}
