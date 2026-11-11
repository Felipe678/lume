import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lume/app/shell/app_page_scaffold.dart';
import 'package:lume/core/theme/app_motion_scope.dart';

import '../../helpers/themed_app.dart';

void _reduce(WidgetTester tester, {required bool on}) {
  tester.platformDispatcher.accessibilityFeaturesTestValue = FakeAccessibilityFeatures(
    disableAnimations: on,
  );
  addTearDown(tester.platformDispatcher.clearAccessibilityFeaturesTestValue);
}

bool? _read;

Widget _probe() => Builder(
  builder: (context) {
    _read = AppMotionScope.of(context).reduced;
    return const SizedBox();
  },
);

AppPageScaffold _scaffold() => AppPageScaffold(
  bodyBuilder: (context, wide) {
    _read = AppMotionScope.of(context).reduced;
    return const SizedBox(height: 10);
  },
);

void main() {
  setUp(() => _read = null);

  group('AppMotionScope.of sem escopo (cai no MediaQuery)', () {
    testWidgets('sem a flag: false', (tester) async {
      await tester.pumpWidget(themedApp(_probe()));
      expect(_read, isFalse);
    });

    testWidgets('com disableAnimations: true', (tester) async {
      _reduce(tester, on: true);
      await tester.pumpWidget(themedApp(_probe()));
      expect(_read, isTrue);
    });
  });

  group('AppMotionScope explícito', () {
    testWidgets('o escopo vale mais que o sistema', (tester) async {
      await tester.pumpWidget(themedApp(AppMotionScope(reduced: true, child: _probe())));
      expect(_read, isTrue);
    });

    test('updateShouldNotify só quando reduced muda', () {
      const a = AppMotionScope(reduced: false, child: SizedBox());
      expect(a.updateShouldNotify(const AppMotionScope(reduced: false, child: SizedBox())), isFalse);
      expect(a.updateShouldNotify(const AppMotionScope(reduced: true, child: SizedBox())), isTrue);
    });
  });

  group('AppPageScaffold fornece o escopo', () {
    testWidgets('sanidade: a flag do sistema chega ao MediaQuery do app', (tester) async {
      _reduce(tester, on: true);
      late bool seen;
      await tester.pumpWidget(
        themedApp(
          Builder(
            builder: (c) {
              seen = MediaQuery.disableAnimationsOf(c);
              return const SizedBox();
            },
          ),
        ),
      );
      expect(seen, isTrue);
    });

    testWidgets('reduced true com disableAnimations', (tester) async {
      setScreen(tester, const Size(1440, 900));
      _reduce(tester, on: true);
      await tester.pumpWidget(themedApp(_scaffold()));
      expect(_read, isTrue);
    });

    testWidgets('reduced false sem a flag', (tester) async {
      setScreen(tester, const Size(1440, 900));
      await tester.pumpWidget(themedApp(_scaffold()));
      expect(_read, isFalse);
    });

    testWidgets('reduzido: sem frame agendado após o primeiro pump', (tester) async {
      // Guarda para a LUME-72: não se exige entrada de tela (ainda não existe), só que o
      // modo reduzido não deixa animação rodando. O critério "entrada não anima" fecha na LUME-72.
      setScreen(tester, const Size(1440, 900));
      _reduce(tester, on: true);
      await tester.pumpWidget(themedApp(_scaffold()));
      expect(_read, isTrue);
      expect(tester.hasRunningAnimations, isFalse);
      // Um único pump basta para assentar: nada fica agendado depois do primeiro frame.
      expect(await tester.pumpAndSettle(), 1);
    });

    testWidgets('relê quando o sistema muda com a página montada', (tester) async {
      setScreen(tester, const Size(1440, 900));
      await tester.pumpWidget(themedApp(_scaffold()));
      expect(_read, isFalse);
      _reduce(tester, on: true);
      await tester.pump();
      expect(_read, isTrue);
    });
  });
}
