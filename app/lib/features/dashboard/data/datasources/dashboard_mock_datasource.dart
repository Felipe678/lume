import '../../domain/entities/active_goal.dart';
import '../../domain/entities/daily_effort.dart';
import '../../domain/entities/dashboard_snapshot.dart';
import '../../domain/entities/day_progress.dart';
import '../../domain/entities/goal_color.dart';
import '../../domain/entities/goals_progress.dart';
import 'package:lume/core/modules/life_module_catalog.dart';
import '../../domain/entities/scheduled_activity.dart';
import '../../domain/entities/today_agenda.dart';
import '../../domain/entities/week_consistency.dart';

// Dados de exemplo até a página de Tarefas, Rotina e Objetivos alimentar o dashboard.
class DashboardMockDataSource {
  static const List<double> _effortHours = [
    2.5, 1, 3, 4, 3.5, 0, 2, //
    3, 2.5, 4, 5, 3.5, 1.5, 2.8,
  ];

  const DashboardMockDataSource();

  DashboardSnapshot load(DateTime now) {
    final agenda = TodayAgenda(_activitiesAround(now));
    final done = agenda.activities.where((a) => !a.end.isAfter(now)).length;
    return DashboardSnapshot(
      userName: 'Felipe',
      agenda: agenda,
      dayProgress: DayProgress(completed: done, total: agenda.activities.length),
      weekConsistency: const WeekConsistency(activeDays: 5),
      goalsProgress: const GoalsProgress(completedSteps: 12, totalSteps: 32),
      effort: _effortEndingAt(now),
      activeGoals: const [
        ActiveGoal(title: 'App Lume', color: GoalColor.violet, progress: 0.40),
        ActiveGoal(title: 'Fluência em inglês', color: GoalColor.sky, progress: 0.25),
        ActiveGoal(title: 'Saúde em dia', color: GoalColor.emerald, progress: 0.60),
        ActiveGoal(title: 'Ler 12 livros', color: GoalColor.amber, progress: 0.33),
      ],
      modules: LifeModuleCatalog.all,
    );
  }

  List<ScheduledActivity> _activitiesAround(DateTime now) {
    final halfHour = DateTime(now.year, now.month, now.day, now.hour, now.minute < 30 ? 0 : 30);
    final anchor = halfHour.subtract(const Duration(minutes: 30));
    ScheduledActivity at(
      int offsetMin,
      int durationMin,
      String title, [
      String? goal,
      GoalColor? color,
    ]) {
      final start = anchor.add(Duration(minutes: offsetMin));
      return ScheduledActivity(
        title: title,
        start: start,
        end: start.add(Duration(minutes: durationMin)),
        goalTitle: goal,
        goalColor: color,
      );
    }

    final all = [
      at(-300, 60, 'Treino', 'Saúde em dia', GoalColor.emerald),
      at(-210, 45, 'Inglês', 'Fluência em inglês', GoalColor.sky),
      at(-90, 60, 'Almoço'),
      at(0, 90, 'Estudar Flutter', 'App Lume', GoalColor.violet),
      at(120, 45, 'Caminhada', 'Saúde em dia', GoalColor.emerald),
      at(210, 45, 'Conversação em inglês', 'Fluência em inglês', GoalColor.sky),
      at(300, 30, 'Leitura', 'Ler 12 livros', GoalColor.amber),
    ];
    // Blocos não cruzam a meia-noite: descarta o que cair fora de hoje.
    return all.where((a) => _sameDay(a.start, now) && _sameDay(a.end, now)).toList();
  }

  List<DailyEffort> _effortEndingAt(DateTime now) {
    final today = DateTime(now.year, now.month, now.day);
    final count = _effortHours.length;
    return [
      for (var i = 0; i < count; i++)
        DailyEffort(
          date: DateTime(today.year, today.month, today.day - (count - 1 - i)),
          hours: _effortHours[i],
        ),
    ];
  }

  bool _sameDay(DateTime a, DateTime b) => a.year == b.year && a.month == b.month && a.day == b.day;
}
