import 'active_goal.dart';
import 'daily_effort.dart';
import 'day_progress.dart';
import 'goals_progress.dart';
import 'package:lume/core/modules/life_module.dart';
import 'today_agenda.dart';
import 'week_consistency.dart';

class DashboardSnapshot {
  final String userName;
  final TodayAgenda agenda;
  final DayProgress dayProgress;
  final WeekConsistency weekConsistency;
  final GoalsProgress goalsProgress;
  final List<DailyEffort> effort;
  final List<ActiveGoal> activeGoals;
  final List<LifeModule> modules;

  const DashboardSnapshot({
    required this.userName,
    required this.agenda,
    required this.dayProgress,
    required this.weekConsistency,
    required this.goalsProgress,
    required this.effort,
    required this.activeGoals,
    required this.modules,
  });
}
