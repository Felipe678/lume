import 'package:flutter_test/flutter_test.dart';
import 'package:lume/features/dashboard/domain/entities/active_goal.dart';
import 'package:lume/features/dashboard/domain/entities/daily_effort.dart';
import 'package:lume/features/dashboard/domain/entities/day_progress.dart';
import 'package:lume/features/dashboard/domain/entities/effort_comparison.dart';
import 'package:lume/features/dashboard/domain/entities/goal_color.dart';
import 'package:lume/features/dashboard/domain/entities/goals_progress.dart';
import 'package:lume/core/modules/life_module.dart';
import 'package:lume/core/modules/life_module_kind.dart';
import 'package:lume/core/modules/module_availability.dart';
import 'package:lume/features/dashboard/domain/entities/week_consistency.dart';

List<DailyEffort> _days(List<double> hours) => [
  for (var i = 0; i < hours.length; i++)
    DailyEffort(date: DateTime(2026, 9, 1 + i), hours: hours[i]),
];

void main() {
  group('Razões de progresso', () {
    test('dia sem blocos tem razão zero, sem divisão por zero', () {
      expect(const DayProgress(completed: 0, total: 0).ratio, 0);
    });

    test('objetivos sem etapas têm razão zero', () {
      expect(const GoalsProgress(completedSteps: 0, totalSteps: 0).ratio, 0);
    });

    test('consistência de 5 em 7 dias', () {
      expect(const WeekConsistency(activeDays: 5).ratio, closeTo(5 / 7, 0.0001));
    });

    test('rejeita concluídos acima do total', () {
      expect(() => DayProgress(completed: 3, total: 2), throwsA(isA<AssertionError>()));
      expect(() => WeekConsistency(activeDays: 8), throwsA(isA<AssertionError>()));
      expect(() => GoalsProgress(completedSteps: 5, totalSteps: 4), throwsA(isA<AssertionError>()));
    });

    test('rejeita progresso de objetivo fora de 0..1', () {
      expect(
        () => ActiveGoal(title: 'X', color: GoalColor.sky, progress: 1.2),
        throwsA(isA<AssertionError>()),
      );
    });

    test('rejeita horas de dedicação acima de 24', () {
      expect(
        () => DailyEffort(date: DateTime(2026, 9, 1), hours: 25),
        throwsA(isA<AssertionError>()),
      );
    });

    test('módulo em breve exige a entrega do roadmap', () {
      expect(
        () => LifeModule(kind: LifeModuleKind.health, availability: ModuleAvailability.comingSoon),
        throwsA(isA<AssertionError>()),
      );
    });
  });

  group('EffortComparison.fromDaily', () {
    test('compara os últimos 7 dias com os 7 anteriores', () {
      final c = EffortComparison.fromDaily(_days([1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2]));

      expect(c.previousHours, 7);
      expect(c.recentHours, 14);
      expect(c.difference, 7);
    });

    test('ignora a ordem de entrada', () {
      final days = _days([1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2]).reversed.toList();

      expect(EffortComparison.fromDaily(days).recentHours, 14);
    });

    test('com menos de 7 dias não há período anterior', () {
      final c = EffortComparison.fromDaily(_days([3, 2]));

      expect(c.recentHours, 5);
      expect(c.previousHours, 0);
    });

    test('lista vazia gera zero', () {
      final c = EffortComparison.fromDaily(const []);

      expect(c.recentHours, 0);
      expect(c.previousHours, 0);
    });

    test('período anterior incompleto soma o que existe', () {
      final c = EffortComparison.fromDaily(_days([4, 1, 1, 1, 1, 1, 1, 1]));

      expect(c.recentHours, 7);
      expect(c.previousHours, 4);
    });
  });
}
