import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lume/features/finance/data/datasources/finance_mock_datasource.dart';
import 'package:lume/features/finance/domain/entities/finance_snapshot.dart';
import 'package:lume/features/finance/presentation/pages/finance_page.dart';
import 'package:lume/features/finance/presentation/widgets/finance_compact_layout.dart';
import 'package:lume/features/finance/presentation/widgets/finance_wide_layout.dart';

import '../../../../helpers/themed_app.dart';

void main() {
  final snapshot = const FinanceMockDataSource().load();

  group('FinancePage', () {
    testWidgets('usa o layout largo no desktop', (tester) async {
      setScreen(tester, const Size(1440, 900));
      await tester.pumpWidget(themedApp(FinancePage(snapshot: snapshot)));

      expect(find.byType(FinanceWideLayout), findsOneWidget);
      expect(find.text('Cartão de crédito universal'), findsOneWidget);
      expect(find.text('Últimas transações'), findsOneWidget);
      expect(find.text('Tendência de gastos'), findsOneWidget);
      expect(find.text('Transações periódicas'), findsOneWidget);
    });

    testWidgets('usa o layout compacto no celular', (tester) async {
      setScreen(tester, const Size(390, 844));
      await tester.pumpWidget(themedApp(FinancePage(snapshot: snapshot)));

      expect(find.byType(FinanceCompactLayout), findsOneWidget);
    });

    for (final mode in const [ThemeMode.dark, ThemeMode.light]) {
      for (final size in screenSizes) {
        testWidgets('não estoura em ${size.width.toInt()}x${size.height.toInt()} (${mode.name})', (
          tester,
        ) async {
          setScreen(tester, size);
          await tester.pumpWidget(themedApp(FinancePage(snapshot: snapshot), mode: mode));

          expect(tester.takeException(), isNull);
        });
      }
    }

    testWidgets('mostra estados vazios sem dados', (tester) async {
      setScreen(tester, const Size(1440, 900));
      final empty = FinanceSnapshot(
        card: snapshot.card,
        metrics: const [],
        transactions: const [],
        recurringExpenses: const [],
        spendingTrend: const [],
        topCategories: const [],
        monthOverMonthChange: 0,
      );
      await tester.pumpWidget(themedApp(FinancePage(snapshot: empty)));

      expect(find.text('Nenhuma transação ainda'), findsOneWidget);
      expect(find.text('Nenhuma transação periódica cadastrada'), findsOneWidget);
      expect(find.text('Sem gastos no período'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });
  });
}
