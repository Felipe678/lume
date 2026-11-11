class WeekConsistency {
  final int activeDays;
  final int windowDays;

  const WeekConsistency({required this.activeDays, this.windowDays = 7})
    : assert(windowDays > 0, 'windowDays deve ser positivo'),
      assert(
        activeDays >= 0 && activeDays <= windowDays,
        'activeDays deve estar entre 0 e windowDays',
      );

  double get ratio => activeDays / windowDays;
}
