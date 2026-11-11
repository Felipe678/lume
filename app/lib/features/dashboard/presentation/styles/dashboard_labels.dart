import 'package:intl/intl.dart';

import '../../../../core/utils/duration_formatter.dart';
import '../../domain/entities/day_progress.dart';
import '../../domain/entities/effort_comparison.dart';
import 'package:lume/core/modules/life_module.dart';
import 'package:lume/core/modules/life_module_kind.dart';
import '../../domain/entities/scheduled_activity.dart';

abstract final class DashboardLabels {
  static final DateFormat _time = DateFormat('HH:mm');
  static final DateFormat _dayLine = DateFormat("EEEE, d 'de' MMMM", 'pt_BR');
  static final DateFormat _shortDate = DateFormat('dd/MM');

  static String greeting(DateTime now) {
    if (now.hour >= 5 && now.hour < 12) return 'Bom dia';
    if (now.hour >= 12 && now.hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  static String salutation(String userName, DateTime now) =>
      userName.trim().isEmpty ? greeting(now) : '${greeting(now)}, ${userName.trim()}';

  static String dayLine(DateTime now) => _dayLine.format(now);

  static String headerLine(String userName, DateTime now) =>
      '${salutation(userName, now)}   ·   ${dayLine(now)}';

  static String time(DateTime value) => _time.format(value);

  static String timeRange(ScheduledActivity activity) =>
      '${time(activity.start)} – ${time(activity.end)}';

  static String shortDate(DateTime value) => _shortDate.format(value);

  static String goalOf(ScheduledActivity activity) => activity.goalTitle ?? 'Obrigatória';

  static String dayBlocks(DayProgress progress) => '${progress.completed} de ${progress.total}';

  static String moduleSummary(LifeModule module, DayProgress dayProgress) {
    if (!module.isAvailable) return 'Em breve · ${module.roadmapStage}';
    return switch (module.kind) {
      LifeModuleKind.time => '${dayBlocks(dayProgress)} blocos hoje',
      _ => 'Disponível',
    };
  }

  static String effortComparison(EffortComparison comparison) {
    final recent = DurationFormatter.hours(comparison.recentHours);
    final diff = (comparison.difference * 2).round() / 2;
    if (diff == 0) return '$recent nos últimos 7 dias, no mesmo ritmo dos 7 anteriores.';
    final amount = DurationFormatter.hours(diff.abs());
    if (diff > 0) return '$recent nos últimos 7 dias, $amount a mais que nos 7 anteriores.';
    return '$recent nos últimos 7 dias, $amount a menos que nos 7 anteriores. '
        'Constância vale mais que intensidade.';
  }
}
