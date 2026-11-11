class DailyEffort {
  final DateTime date;
  final double hours;

  const DailyEffort({required this.date, required this.hours})
    : assert(hours >= 0 && hours <= 24, 'hours deve estar entre 0 e 24');
}
