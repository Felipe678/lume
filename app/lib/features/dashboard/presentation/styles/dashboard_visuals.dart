import 'package:flutter/material.dart';

import '../../../../core/theme/app_palette.dart';
import '../../domain/entities/goal_color.dart';
import '../../domain/entities/scheduled_activity.dart';

abstract final class DashboardVisuals {
  static const Color obligatory = Color(0xFF78716C);
  static const Color dayRing = AppPalette.violet;
  static const Color weekRing = AppPalette.cyan;
  static const Color goalsRing = AppPalette.orange;

  static Color goal(GoalColor color) => switch (color) {
    GoalColor.amber => const Color(0xFFF59E0B),
    GoalColor.sky => const Color(0xFF0EA5E9),
    GoalColor.emerald => const Color(0xFF10B981),
    GoalColor.rose => const Color(0xFFF43F5E),
    GoalColor.violet => const Color(0xFF8B5CF6),
    GoalColor.lime => const Color(0xFF84CC16),
    GoalColor.cyan => const Color(0xFF06B6D4),
    GoalColor.fuchsia => const Color(0xFFD946EF),
  };

  static Color activity(ScheduledActivity activity) {
    final color = activity.goalColor;
    return color == null ? obligatory : goal(color);
  }
}
