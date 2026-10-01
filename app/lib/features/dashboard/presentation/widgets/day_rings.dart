import 'package:flutter/material.dart';

import '../../../../core/widgets/ring_stat_tile.dart';
import '../../domain/entities/day_progress.dart';
import '../../domain/entities/goals_progress.dart';
import '../../domain/entities/week_consistency.dart';
import '../styles/dashboard_labels.dart';
import '../styles/dashboard_visuals.dart';

class DayRings extends StatelessWidget {
  final DayProgress day;
  final WeekConsistency week;
  final GoalsProgress goals;
  final bool compact;

  const DayRings({
    super.key,
    required this.day,
    required this.week,
    required this.goals,
    required this.compact,
  });

  @override
  Widget build(BuildContext context) {
    final tiles = [
      RingStatTile(
        progress: day.ratio,
        centerLabel: '${(day.ratio * 100).round()}%',
        value: DashboardLabels.dayBlocks(day),
        label: 'Blocos hoje',
        accent: DashboardVisuals.dayRing,
        compact: compact,
      ),
      RingStatTile(
        progress: week.ratio,
        centerLabel: '${week.activeDays}/${week.windowDays}',
        value: '${week.activeDays} de ${week.windowDays}',
        label: 'Dias na semana',
        accent: DashboardVisuals.weekRing,
        compact: compact,
      ),
      RingStatTile(
        progress: goals.ratio,
        centerLabel: '${(goals.ratio * 100).round()}%',
        value: '${goals.completedSteps} de ${goals.totalSteps}',
        label: 'Etapas feitas',
        accent: DashboardVisuals.goalsRing,
        compact: compact,
      ),
    ];

    if (compact) {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [for (final tile in tiles) Expanded(child: tile)],
      );
    }
    return Wrap(spacing: 36, runSpacing: 24, children: tiles);
  }
}
