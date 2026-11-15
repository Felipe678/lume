import 'package:flutter/material.dart';

import '../../../../core/theme/app_palette.dart';
import '../../domain/entities/goal_color.dart';
import '../../domain/entities/scheduled_activity.dart';

abstract final class DashboardVisuals {
  static const Color obligatory = AppPalette.goalObligatory;
  static const Color dayRing = AppPalette.violet;
  static const Color weekRing = AppPalette.cyan;
  static const Color goalsRing = AppPalette.orange;

  static Color goal(GoalColor color) => switch (color) {
    GoalColor.amber => AppPalette.goalAmber,
    GoalColor.sky => AppPalette.goalSky,
    GoalColor.emerald => AppPalette.goalEmerald,
    GoalColor.rose => AppPalette.goalRose,
    GoalColor.violet => AppPalette.goalViolet,
    GoalColor.lime => AppPalette.goalLime,
    GoalColor.cyan => AppPalette.goalCyan,
    GoalColor.fuchsia => AppPalette.goalFuchsia,
  };

  static Color activity(ScheduledActivity activity) {
    final color = activity.goalColor;
    return color == null ? obligatory : goal(color);
  }
}
