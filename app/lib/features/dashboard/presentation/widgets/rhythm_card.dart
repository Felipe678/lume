import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_palette.dart';
import '../../../../core/utils/duration_formatter.dart';
import '../../../../core/widgets/bar_chart.dart';
import '../../../../core/widgets/bar_chart_entry.dart';
import '../../../../core/widgets/section_title.dart';
import '../../domain/entities/daily_effort.dart';
import '../../domain/entities/day_progress.dart';
import '../../domain/entities/effort_comparison.dart';
import 'package:lume/core/modules/life_module.dart';
import '../styles/dashboard_labels.dart';
import 'life_modules_grid.dart';

class RhythmCard extends StatelessWidget {
  static const double width = 522;
  static const int _recentWindow = 7;

  final List<DailyEffort> effort;
  final DateTime now;
  final List<LifeModule> modules;
  final DayProgress dayProgress;

  const RhythmCard({
    super.key,
    required this.effort,
    required this.now,
    required this.modules,
    required this.dayProgress,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Container(
      padding: const EdgeInsets.all(26),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.35),
            blurRadius: 40,
            offset: const Offset(0, 16),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionTitle('Ritmo da semana'),
          const SizedBox(height: 16),
          BarChart(entries: _entries(colors), emptyMessage: 'Sem registros de dedicação ainda'),
          if (effort.isNotEmpty) ...[
            const SizedBox(height: 16),
            Text(
              DashboardLabels.effortComparison(EffortComparison.fromDaily(effort)),
              style: TextStyle(fontSize: 13, color: colors.textSecondary),
            ),
          ],
          const SizedBox(height: 32),
          Text(
            'Frentes da vida',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: colors.textPrimary),
          ),
          const SizedBox(height: 6),
          Text(
            'Cada área da sua vida em um só lugar.',
            style: TextStyle(fontSize: 13, color: colors.textSecondary),
          ),
          const SizedBox(height: 20),
          LifeModulesGrid(modules: modules, dayProgress: dayProgress),
        ],
      ),
    );
  }

  List<BarChartEntry> _entries(AppColors colors) {
    final today = DateTime(now.year, now.month, now.day);
    final recentStart = DateTime(today.year, today.month, today.day - (_recentWindow - 1));
    final sorted = [...effort]..sort((a, b) => a.date.compareTo(b.date));
    return [
      for (final day in sorted)
        _entry(
          day,
          colors,
          isToday: _sameDay(day.date, today),
          isRecent: !day.date.isBefore(recentStart),
        ),
    ];
  }

  BarChartEntry _entry(
    DailyEffort day,
    AppColors colors, {
    required bool isToday,
    required bool isRecent,
  }) {
    final color = isToday
        ? AppPalette.cyan
        : isRecent
        ? AppPalette.violet
        : colors.barMuted;
    return BarChartEntry(
      label: '${day.date.day}',
      value: day.hours,
      color: color,
      labelColor: isToday ? AppPalette.cyan : colors.textMuted,
      glow: isToday,
      tooltip: '${DashboardLabels.shortDate(day.date)}: ${DurationFormatter.hours(day.hours)}',
    );
  }

  bool _sameDay(DateTime a, DateTime b) => a.year == b.year && a.month == b.month && a.day == b.day;
}
