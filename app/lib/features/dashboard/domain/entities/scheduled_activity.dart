import 'goal_color.dart';

class ScheduledActivity {
  final String title;
  final DateTime start;
  final DateTime end;
  final String? goalTitle;
  final GoalColor? goalColor;

  ScheduledActivity({
    required this.title,
    required this.start,
    required this.end,
    this.goalTitle,
    this.goalColor,
  }) : assert(title.trim().isNotEmpty, 'title não pode ser vazio'),
       assert(end.isAfter(start), 'end deve ser depois de start'),
       assert((goalTitle == null) == (goalColor == null), 'goalTitle e goalColor andam juntos');

  bool get isObligatory => goalTitle == null;

  Duration get duration => end.difference(start);

  /// Intervalo semiaberto [start, end).
  bool isActiveAt(DateTime now) => !now.isBefore(start) && now.isBefore(end);

  Duration remainingAt(DateTime now) {
    if (!now.isBefore(end)) return Duration.zero;
    if (now.isBefore(start)) return duration;
    return end.difference(now);
  }

  double progressAt(DateTime now) {
    final elapsed = now.difference(start).inMilliseconds / duration.inMilliseconds;
    return elapsed.clamp(0.0, 1.0);
  }
}
