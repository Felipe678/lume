import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lume/features/dashboard/data/datasources/dashboard_mock_datasource.dart';
import 'package:lume/features/dashboard/domain/entities/dashboard_snapshot.dart';
import 'package:lume/features/dashboard/domain/entities/scheduled_activity.dart';
import 'package:lume/features/dashboard/domain/entities/today_agenda.dart';
import 'package:lume/features/dashboard/presentation/pages/dashboard_page.dart';
import 'package:lume/features/dashboard/presentation/widgets/dashboard_compact_layout.dart';
import 'package:lume/features/dashboard/presentation/widgets/dashboard_wide_layout.dart';

import '../../../../helpers/themed_app.dart';

final _now = DateTime(2026, 9, 28, 15, 10);

DashboardSnapshot _withAgenda(DashboardSnapshot base, List<ScheduledActivity> activities) {
  return DashboardSnapshot(
    userName: base.userName,
    agenda: TodayAgenda(activities),
    dayProgress: base.dayProgress,
    weekConsistency: base.weekConsistency,
    goalsProgress: base.goalsProgress,
    effort: base.effort,
    activeGoals: base.activeGoals,
    modules: base.modules,
  );
}

Widget _page(DashboardSnapshot snapshot, {ThemeMode mode = ThemeMode.dark}) => themedApp(
  DashboardPage(snapshot: snapshot, clock: () => _now),
  mode: mode,
);

void main() {
  final snapshot = const DashboardMockDataSource().load(_now);

  group('DashboardPage', () {
    testWidgets('desktop mostra todos os blocos do dia', (tester) async {
      setScreen(tester, const Size(1440, 900));
      await tester.pumpWidget(_page(snapshot));

      expect(find.byType(DashboardWideLayout), findsOneWidget);
      expect(find.text('Seu dia'), findsOneWidget);
      expect(find.text('AGORA'), findsOneWidget);
      expect(find.text('Estudar Flutter'), findsOneWidget);
      expect(find.text('Próximas atividades'), findsOneWidget);
      expect(find.text('Objetivos ativos'), findsOneWidget);
      expect(find.text('Ritmo da semana'), findsOneWidget);
      expect(find.text('Frentes da vida'), findsOneWidget);
      expect(find.text('Em breve · E2'), findsOneWidget);
    });

    testWidgets('celular usa layout compacto', (tester) async {
      setScreen(tester, const Size(390, 844));
      await tester.pumpWidget(_page(snapshot));

      expect(find.byType(DashboardCompactLayout), findsOneWidget);
    });

    for (final mode in const [ThemeMode.dark, ThemeMode.light]) {
      for (final size in screenSizes) {
        testWidgets('não estoura em ${size.width.toInt()}x${size.height.toInt()} (${mode.name})', (
          tester,
        ) async {
          setScreen(tester, size);
          await tester.pumpWidget(_page(snapshot, mode: mode));

          expect(tester.takeException(), isNull);
        });
      }
    }

    testWidgets('fonte do sistema ampliada não quebra o celular', (tester) async {
      setScreen(tester, const Size(390, 844));
      await tester.pumpWidget(
        MediaQuery(
          data: const MediaQueryData(size: Size(390, 844), textScaler: TextScaler.linear(1.3)),
          child: _page(snapshot),
        ),
      );

      expect(tester.takeException(), isNull);
    });

    testWidgets('card Agora mostra tempo restante e a próxima atividade', (tester) async {
      setScreen(tester, const Size(1440, 900));
      final agenda = [
        ScheduledActivity(
          title: 'Foco profundo',
          start: DateTime(2026, 9, 28, 14, 30),
          end: DateTime(2026, 9, 28, 15, 52),
        ),
        ScheduledActivity(
          title: 'Academia',
          start: DateTime(2026, 9, 28, 16),
          end: DateTime(2026, 9, 28, 17),
        ),
      ];
      await tester.pumpWidget(_page(_withAgenda(snapshot, agenda)));

      expect(find.text('faltam 42 min'), findsOneWidget);
      expect(find.text('Depois: Academia · 16:00'), findsOneWidget);
    });

    testWidgets('intervalo entre atividades mostra tempo livre', (tester) async {
      setScreen(tester, const Size(1440, 900));
      final agenda = [
        ScheduledActivity(
          title: 'Academia',
          start: DateTime(2026, 9, 28, 16),
          end: DateTime(2026, 9, 28, 17),
        ),
      ];
      await tester.pumpWidget(_page(_withAgenda(snapshot, agenda)));

      expect(find.text('Tempo livre'), findsOneWidget);
      expect(find.text('Próxima: Academia às 16:00'), findsOneWidget);
      expect(find.text('em 50 min'), findsOneWidget);
    });

    testWidgets('depois da última atividade o dia está concluído', (tester) async {
      setScreen(tester, const Size(1440, 900));
      final agenda = [
        ScheduledActivity(
          title: 'Treino',
          start: DateTime(2026, 9, 28, 7),
          end: DateTime(2026, 9, 28, 8),
        ),
      ];
      await tester.pumpWidget(_page(_withAgenda(snapshot, agenda)));

      expect(find.text('Dia concluído'), findsOneWidget);
      expect(find.text('Nada mais agendado para hoje'), findsOneWidget);
    });

    testWidgets('sem rotina orienta a montar a grade', (tester) async {
      setScreen(tester, const Size(1440, 900));
      await tester.pumpWidget(_page(_withAgenda(snapshot, const [])));

      expect(find.text('Sem rotina hoje'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    testWidgets('estados vazios não quebram a tela', (tester) async {
      setScreen(tester, const Size(390, 844));
      final empty = DashboardSnapshot(
        userName: '',
        agenda: TodayAgenda(const []),
        dayProgress: snapshot.dayProgress,
        weekConsistency: snapshot.weekConsistency,
        goalsProgress: snapshot.goalsProgress,
        effort: const [],
        activeGoals: const [],
        modules: const [],
      );
      await tester.pumpWidget(_page(empty));

      expect(find.text('Nenhum objetivo ativo'), findsOneWidget);
      expect(find.text('Sem registros de dedicação ainda'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });
  });

  group('DashboardMockDataSource', () {
    test('nunca gera atividades fora do dia atual', () {
      for (final hour in [0, 3, 12, 22, 23]) {
        final now = DateTime(2026, 9, 28, hour, 45);
        final data = const DashboardMockDataSource().load(now);
        for (final a in data.agenda.activities) {
          expect(a.start.day, 28, reason: 'início às ${a.start} com agora $now');
          expect(a.end.day, 28, reason: 'fim às ${a.end} com agora $now');
        }
      }
    });

    test('progresso do dia bate com as atividades encerradas', () {
      final data = const DashboardMockDataSource().load(_now);
      final done = data.agenda.activities.where((a) => !a.end.isAfter(_now)).length;

      expect(data.dayProgress.completed, done);
      expect(data.dayProgress.total, data.agenda.activities.length);
    });
  });
}
