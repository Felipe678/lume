class DayProgress {
  final int completed;
  final int total;

  const DayProgress({required this.completed, required this.total})
    : assert(total >= 0, 'total não pode ser negativo'),
      assert(completed >= 0 && completed <= total, 'completed deve estar entre 0 e total');

  double get ratio => total == 0 ? 0 : completed / total;
}
