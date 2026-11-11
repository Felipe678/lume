import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lume/app/lume_app.dart';
import 'package:lume/app/navigation/modules_menu_panel.dart';
import 'package:lume/core/theme/app_motion.dart';
import 'package:lume/core/theme/app_page_transitions_builder.dart';
import 'package:lume/core/theme/app_theme.dart';
import 'package:lume/features/time/presentation/pages/time_page.dart';

import '../../helpers/themed_app.dart';

/// Delegate espião com durações do próprio AppMotion.
class _SpyBuilder extends PageTransitionsBuilder {
  int calls = 0;

  @override
  Duration get transitionDuration => AppMotion.page;

  @override
  Duration get reverseTransitionDuration => AppMotion.base;

  @override
  Widget buildTransitions<T>(
    PageRoute<T> route,
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    calls++;
    return KeyedSubtree(key: const ValueKey('delegado'), child: child);
  }
}

void _reduce(WidgetTester tester) {
  tester.platformDispatcher.accessibilityFeaturesTestValue = const FakeAccessibilityFeatures(
    disableAnimations: true,
  );
  addTearDown(tester.platformDispatcher.clearAccessibilityFeaturesTestValue);
}

Finder _above(Type page, Type ancestor) =>
    find.ancestor(of: find.byType(page), matching: find.byType(ancestor));

void main() {
  group('AppPageTransitionsBuilder (unidade, com delegate espião)', () {
    late _SpyBuilder spy;
    late AppPageTransitionsBuilder builder;
    late AnimationController controller;
    final route = MaterialPageRoute<void>(builder: (_) => const SizedBox());

    late Widget out;

    Future<void> build(WidgetTester tester) async {
      await tester.pumpWidget(
        themedApp(
          Builder(
            builder: (context) {
              out = builder.buildTransitions<void>(
                route,
                context,
                controller,
                const AlwaysStoppedAnimation<double>(0),
                const Text('filho'),
              );
              return out;
            },
          ),
        ),
      );
    }

    setUp(() {
      spy = _SpyBuilder();
      builder = AppPageTransitionsBuilder(delegate: spy);
    });

    AnimationController newController(WidgetTester tester) {
      controller = AnimationController(vsync: tester, duration: spy.transitionDuration);
      addTearDown(controller.dispose);
      return controller;
    }

    testWidgets('normal: delega e repassa as durações do delegate', (tester) async {
      newController(tester);
      await build(tester);

      expect(spy.calls, greaterThan(0));
      expect(out.key, const ValueKey('delegado'));
      expect(out, isNot(isA<FadeTransition>()));
      expect(builder.transitionDuration, spy.transitionDuration);
      expect(builder.reverseTransitionDuration, spy.reverseTransitionDuration);
    });

    testWidgets('reduzido: só fade e termina opaco em instant', (tester) async {
      _reduce(tester);
      newController(tester);
      await build(tester);

      expect(spy.calls, 0);
      final fade = out as FadeTransition;
      expect(fade.opacity.value, 0);
      expect((fade.child! as Text).data, 'filho');

      controller.value = AppMotion.instant.inMicroseconds / spy.transitionDuration.inMicroseconds;
      expect(fade.opacity.value, closeTo(1, 1e-9));

      controller.value = AppMotion.instant.inMicroseconds / spy.transitionDuration.inMicroseconds / 2;
      expect(fade.opacity.value, inExclusiveRange(0, 1));
    });

    testWidgets('reduzido: na volta o fade ocupa só o fim da duração', (tester) async {
      _reduce(tester);
      newController(tester);
      controller.value = 1;
      await build(tester);
      final fade = out as FadeTransition;
      controller.reverse();
      await tester.pump();

      final fraction = AppMotion.instant.inMicroseconds / spy.reverseTransitionDuration.inMicroseconds;
      controller.value = 1 - fraction / 2;
      expect(fade.opacity.value, inExclusiveRange(0, 1));
      controller.value = 1 - fraction;
      expect(fade.opacity.value, closeTo(0, 1e-9));
    });
  });

  group('Tema registra o builder por plataforma', () {
    for (final theme in [AppTheme.light(), AppTheme.dark()]) {
      test('tema ${theme.brightness.name}: todas as plataformas usam AppPageTransitionsBuilder', () {
        final builders = theme.pageTransitionsTheme.builders;
        expect(builders.keys.toSet(), TargetPlatform.values.toSet());
        for (final b in builders.values) {
          expect(b, isA<AppPageTransitionsBuilder>());
        }
      });
    }
  });

  // Critério "entrada da tela não anima" (LUME-71): NÃO cumprido aqui; a entrada da tela nasce na LUME-72.
  // Estes testes cobrem só a transição da rota; a guarda do escopo está em app_motion_scope_test.dart.
  group('Troca de página pelo menu', () {
    Future<void> goToTime(WidgetTester tester) async {
      await tester.tap(find.byTooltip('Módulos'));
      await tester.pumpAndSettle();
      await tester.tap(
        find.descendant(
          of: find.byType(ModulesMenuPanel),
          matching: find.text('Tempo e objetivos'),
        ),
      );
    }

    testWidgets('reduzido: página nova opaca em instant, sem escala nem deslocamento', (tester) async {
      setScreen(tester, const Size(1440, 900));
      _reduce(tester);
      await tester.pumpWidget(const LumeApp());

      await goToTime(tester);
      await tester.pump();
      await tester.pump(AppMotion.instant);

      expect(find.byType(TimePage), findsOneWidget);
      final fades = tester.widgetList<FadeTransition>(_above(TimePage, FadeTransition));
      expect(fades, isNotEmpty);
      for (final f in fades) {
        expect(f.opacity.value, 1);
      }
      expect(_above(TimePage, ScaleTransition), findsNothing);
      expect(_above(TimePage, SlideTransition), findsNothing);
      expect(tester.takeException(), isNull);
    });

    testWidgets('normal: navega e assenta sem erro', (tester) async {
      setScreen(tester, const Size(1440, 900));
      await tester.pumpWidget(const LumeApp());

      await goToTime(tester);
      await tester.pumpAndSettle();

      expect(find.byType(TimePage), findsOneWidget);
      expect(tester.takeException(), isNull);
    });
  });

  group('Higiene de movimento em app/lib', () {
    final sources = Directory('lib')
        .listSync(recursive: true)
        .whereType<File>()
        .where((f) => f.path.endsWith('.dart'))
        .where((f) => !f.path.replaceAll('\\', '/').endsWith('core/theme/app_motion.dart'))
        .toList();

    test('literais de movimento só existem em app_motion.dart', () {
      final pattern = RegExp(
        r'Duration\(milliseconds|Curves\.|Cubic\(|AnimatedContainer|AnimatedSwitcher|\bHero\b',
      );
      final hits = [
        for (final f in sources)
          if (pattern.hasMatch(f.readAsStringSync())) f.path,
      ];
      expect(hits, isEmpty);
    });

    test('usa disableAnimationsOf, nunca MediaQuery.of(...).disableAnimations', () {
      final old = RegExp(r'MediaQuery\.of\([^)]*\)\.disableAnimations|\.disableAnimations(?!Of)');
      final hits = [
        for (final f in sources)
          if (old.hasMatch(f.readAsStringSync())) f.path,
      ];
      expect(hits, isEmpty);
    });
  });
}
