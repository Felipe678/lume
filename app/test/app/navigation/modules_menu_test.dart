import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lume/app/lume_app.dart';
import 'package:lume/app/navigation/app_routes.dart';
import 'package:lume/app/navigation/modules_menu_panel.dart';
import 'package:lume/core/theme/app_motion.dart';
import 'package:lume/features/dashboard/presentation/pages/dashboard_page.dart';
import 'package:lume/features/time/presentation/pages/time_page.dart';

import '../../helpers/themed_app.dart';

Finder _inMenu(String text) =>
    find.descendant(of: find.byType(ModulesMenuPanel), matching: find.text(text));

Future<void> _openMenu(WidgetTester tester) async {
  await tester.tap(find.byTooltip('Módulos'));
  await tester.pumpAndSettle();
}

void main() {
  group('Menu de módulos', () {
    testWidgets('abre com animação de fade e escala', (tester) async {
      setScreen(tester, const Size(1440, 900));
      await tester.pumpWidget(const LumeApp());

      await tester.tap(find.byTooltip('Módulos'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 80));

      final fade = tester.widget<FadeTransition>(
        find
            .ancestor(of: find.byType(ModulesMenuPanel), matching: find.byType(FadeTransition))
            .first,
      );
      expect(fade.opacity.value, greaterThan(0));
      expect(fade.opacity.value, lessThan(1));

      await tester.pumpAndSettle();
      expect(fade.opacity.value, 1);
      expect(find.text('Cada área da sua vida'), findsOneWidget);
    });

    testWidgets('lista a visão geral e todos os módulos do catálogo', (tester) async {
      setScreen(tester, const Size(1440, 900));
      await tester.pumpWidget(const LumeApp());
      await _openMenu(tester);

      for (final title in [
        'Visão geral',
        'Tempo e objetivos',
        'Saúde',
        'Finanças',
        'Patrimônio',
        'Documentos',
      ]) {
        expect(_inMenu(title), findsOneWidget, reason: title);
      }
      expect(_inMenu('Aberto agora'), findsOneWidget);
      expect(_inMenu('Em breve · E2'), findsOneWidget);
    });

    testWidgets('abre a tela do módulo e fecha o menu', (tester) async {
      setScreen(tester, const Size(1440, 900));
      await tester.pumpWidget(const LumeApp());
      await _openMenu(tester);

      await tester.tap(_inMenu('Tempo e objetivos'));
      await tester.pumpAndSettle();

      expect(find.byType(TimePage), findsOneWidget);
      expect(find.byType(ModulesMenuPanel), findsNothing);
    });

    testWidgets('na tela de tempo o módulo atual fica destacado', (tester) async {
      setScreen(tester, const Size(1440, 900));
      await tester.pumpWidget(const LumeApp(initialLocation: AppRoutes.time));
      await _openMenu(tester);

      final selected = tester.getSemantics(_inMenu('Tempo e objetivos'));
      expect(selected.label, contains('Aberto agora'));
    });

    testWidgets('módulo em breve não navega nem fecha o menu', (tester) async {
      setScreen(tester, const Size(1440, 900));
      await tester.pumpWidget(const LumeApp());
      await _openMenu(tester);

      await tester.tap(_inMenu('Saúde'));
      await tester.pumpAndSettle();

      expect(find.byType(ModulesMenuPanel), findsOneWidget);
      expect(find.byType(DashboardPage), findsOneWidget);
    });

    testWidgets('fecha ao tocar fora', (tester) async {
      setScreen(tester, const Size(1440, 900));
      await tester.pumpWidget(const LumeApp());
      await _openMenu(tester);

      await tester.tapAt(const Offset(40, 800));
      await tester.pumpAndSettle();

      expect(find.byType(ModulesMenuPanel), findsNothing);
    });

    testWidgets('fecha com Esc', (tester) async {
      setScreen(tester, const Size(1440, 900));
      await tester.pumpWidget(const LumeApp());
      await _openMenu(tester);

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(find.byType(ModulesMenuPanel), findsNothing);
    });

    for (final size in screenSizes) {
      testWidgets('cabe na tela ${size.width.toInt()}x${size.height.toInt()}', (tester) async {
        setScreen(tester, size);
        await tester.pumpWidget(const LumeApp());
        await _openMenu(tester);

        final panel = tester.getRect(find.byType(ModulesMenuPanel));
        expect(panel.left, greaterThanOrEqualTo(0));
        expect(panel.right, lessThanOrEqualTo(size.width));
        expect(panel.bottom, lessThanOrEqualTo(size.height));
        expect(tester.takeException(), isNull);
      });
    }
  });

  group('Navegação', () {
    testWidgets('card de Tempo no dashboard abre a tela do módulo', (tester) async {
      setScreen(tester, const Size(1440, 1400));
      await tester.pumpWidget(const LumeApp());

      await tester.tap(find.text('Tempo e objetivos'));
      await tester.pumpAndSettle();

      expect(find.byType(TimePage), findsOneWidget);
    });

    testWidgets('rota inexistente volta para a visão geral', (tester) async {
      setScreen(tester, const Size(1440, 900));
      await tester.pumpWidget(const LumeApp(initialLocation: '/nao-existe'));
      await tester.pumpAndSettle();

      expect(find.byType(DashboardPage), findsOneWidget);
    });
  });

  group('Menu de módulos com reduzir movimento', () {
    void reduce(WidgetTester tester) {
      tester.platformDispatcher.accessibilityFeaturesTestValue = const FakeAccessibilityFeatures(
        disableAnimations: true,
      );
      addTearDown(tester.platformDispatcher.clearAccessibilityFeaturesTestValue);
    }

    Finder aboveMenu(Type t) =>
        find.ancestor(of: find.byType(ModulesMenuPanel), matching: find.byType(t));

    // Abre pela barra (o AppTopBar lê o escopo), nunca instanciando a rota à mão.
    Future<void> openByBar(WidgetTester tester) async {
      await tester.tap(find.byTooltip('Módulos'));
      await tester.pump();
      await tester.pump(AppMotion.instant);
    }

    Future<void> setUpReduced(WidgetTester tester, [Size size = const Size(1440, 900)]) async {
      setScreen(tester, size);
      reduce(tester);
      await tester.pumpWidget(const LumeApp());
    }

    testWidgets('abre opaco em instant, só com fade', (tester) async {
      await setUpReduced(tester);
      await openByBar(tester);

      expect(find.byType(ModulesMenuPanel), findsOneWidget);
      final fade = tester.widget<FadeTransition>(aboveMenu(FadeTransition).first);
      expect(fade.opacity.value, 1);
      expect(aboveMenu(ScaleTransition), findsNothing);
      expect(aboveMenu(SlideTransition), findsNothing);
    });

    testWidgets('fecha com Esc em no máximo instant', (tester) async {
      await setUpReduced(tester);
      await openByBar(tester);

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pump();
      await tester.pump(AppMotion.instant);

      expect(find.byType(ModulesMenuPanel), findsNothing);
      expect(tester.binding.hasScheduledFrame, isFalse);
    });

    testWidgets('fecha ao tocar fora em no máximo instant', (tester) async {
      await setUpReduced(tester);
      await openByBar(tester);

      await tester.tapAt(const Offset(40, 800));
      await tester.pump();
      await tester.pump(AppMotion.instant);

      expect(find.byType(ModulesMenuPanel), findsNothing);
    });

    testWidgets('fecha com Voltar em no máximo instant', (tester) async {
      await setUpReduced(tester);
      await openByBar(tester);

      await tester.binding.handlePopRoute();
      await tester.pump();
      await tester.pump(AppMotion.instant);

      expect(find.byType(ModulesMenuPanel), findsNothing);
    });

    testWidgets('escolher um módulo fecha o menu em instant e navega', (tester) async {
      await setUpReduced(tester);
      await openByBar(tester);

      await tester.tap(_inMenu('Tempo e objetivos'));
      await tester.pump();
      await tester.pump(AppMotion.instant);

      expect(find.byType(ModulesMenuPanel), findsNothing);
      await tester.pumpAndSettle();
      expect(find.byType(TimePage), findsOneWidget);
    });

    testWidgets('a 320 px e fonte 1,3x não estoura o layout', (tester) async {
      await setUpReduced(tester, const Size(320, 640));
      tester.platformDispatcher.textScaleFactorTestValue = 1.3;
      addTearDown(tester.platformDispatcher.clearTextScaleFactorTestValue);
      await tester.pump();
      await openByBar(tester);

      final panel = tester.getRect(find.byType(ModulesMenuPanel));
      expect(panel.left, greaterThanOrEqualTo(0));
      expect(panel.right, lessThanOrEqualTo(320));
      expect(panel.bottom, lessThanOrEqualTo(640));
      expect(tester.takeException(), isNull);
    });
  });

  group('Menu de módulos em movimento normal', () {
    testWidgets('anima com escala e fecha em exit, não em instant', (tester) async {
      setScreen(tester, const Size(1440, 900));
      await tester.pumpWidget(const LumeApp());
      await _openMenu(tester);

      expect(
        find.ancestor(of: find.byType(ModulesMenuPanel), matching: find.byType(ScaleTransition)),
        findsWidgets,
      );

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pump();
      await tester.pump(AppMotion.instant);
      expect(find.byType(ModulesMenuPanel), findsOneWidget);

      await tester.pump(AppMotion.exit - AppMotion.instant);
      // O overlay sai da árvore no frame seguinte ao fim da animação (um frame de 16 ms).
      await tester.pump(const Duration(milliseconds: 16));
      expect(find.byType(ModulesMenuPanel), findsNothing);
    });
  });
}
