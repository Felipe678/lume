import 'daily_effort.dart';

class EffortComparison {
  final double recentHours;
  final double previousHours;

  const EffortComparison({required this.recentHours, required this.previousHours})
    : assert(recentHours >= 0 && previousHours >= 0, 'horas não podem ser negativas');

  /// Compara os últimos [window] dias com os [window] dias anteriores.
  factory EffortComparison.fromDaily(List<DailyEffort> days, {int window = 7}) {
    assert(window > 0, 'window deve ser positivo');
    final sorted = [...days]..sort((a, b) => a.date.compareTo(b.date));
    final recent = sorted.length <= window ? sorted : sorted.sublist(sorted.length - window);
    final previousEnd = sorted.length - recent.length;
    final previousStart = previousEnd - window < 0 ? 0 : previousEnd - window;
    final previous = sorted.sublist(previousStart, previousEnd);
    double sum(List<DailyEffort> list) => list.fold(0, (total, d) => total + d.hours);
    return EffortComparison(recentHours: sum(recent), previousHours: sum(previous));
  }

  double get difference => recentHours - previousHours;
}
