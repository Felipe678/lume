import 'package:flutter_test/flutter_test.dart';
import 'package:lume/features/dashboard/domain/entities/day_progress.dart';
import 'package:lume/features/dashboard/domain/entities/effort_comparison.dart';
import 'package:lume/core/modules/life_module.dart';
import 'package:lume/core/modules/life_module_kind.dart';
import 'package:lume/core/modules/module_availability.dart';
import 'package:lume/features/dashboard/presentation/styles/dashboard_labels.dart';

DateTime _at(int hour) => DateTime(2026, 9, 28, hour);

void main() {
  group('DashboardLabels.greeting', () {
    test('madrugada é boa noite', () => expect(DashboardLabels.greeting(_at(4)), 'Boa noite'));
    test('5h é bom dia', () => expect(DashboardLabels.greeting(_at(5)), 'Bom dia'));
    test('12h é boa tarde', () => expect(DashboardLabels.greeting(_at(12)), 'Boa tarde'));
    test('18h é boa noite', () => expect(DashboardLabels.greeting(_at(18)), 'Boa noite'));
  });

  group('DashboardLabels.headerLine', () {
    test('inclui nome e data por extenso', () {
      expect(
        DashboardLabels.headerLine('Felipe', _at(15)),
        'Boa tarde, Felipe   ·   segunda-feira, 28 de setembro',
      );
    });

    test('sem nome mostra só a saudação', () {
      expect(
        DashboardLabels.headerLine('  ', _at(9)),
        'Bom dia   ·   segunda-feira, 28 de setembro',
      );
    });
  });

  group('DashboardLabels.effortComparison', () {
    test('mais horas', () {
      expect(
        DashboardLabels.effortComparison(
          const EffortComparison(recentHours: 21.8, previousHours: 16),
        ),
        '21,8h nos últimos 7 dias, 6h a mais que nos 7 anteriores.',
      );
    });

    test('menos horas traz mensagem acolhedora', () {
      expect(
        DashboardLabels.effortComparison(
          const EffortComparison(recentHours: 10, previousHours: 12),
        ),
        '10h nos últimos 7 dias, 2h a menos que nos 7 anteriores. '
        'Constância vale mais que intensidade.',
      );
    });

    test('diferença pequena é o mesmo ritmo', () {
      expect(
        DashboardLabels.effortComparison(
          const EffortComparison(recentHours: 10, previousHours: 9.8),
        ),
        '10h nos últimos 7 dias, no mesmo ritmo dos 7 anteriores.',
      );
    });
  });

  group('DashboardLabels.moduleSummary', () {
    const progress = DayProgress(completed: 4, total: 6);

    test('módulo de tempo mostra blocos do dia', () {
      const module = LifeModule(
        kind: LifeModuleKind.time,
        availability: ModuleAvailability.available,
      );
      expect(DashboardLabels.moduleSummary(module, progress), '4 de 6 blocos hoje');
    });

    test('módulo em breve mostra a entrega', () {
      const module = LifeModule(
        kind: LifeModuleKind.health,
        availability: ModuleAvailability.comingSoon,
        roadmapStage: 'E2',
      );
      expect(DashboardLabels.moduleSummary(module, progress), 'Em breve · E2');
    });
  });
}
