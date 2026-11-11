import 'goal_color.dart';

class ActiveGoal {
  final String title;
  final GoalColor color;
  final double progress;

  const ActiveGoal({required this.title, required this.color, required this.progress})
    : assert(progress >= 0 && progress <= 1, 'progress deve estar entre 0 e 1');
}
