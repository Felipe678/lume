import 'spending_tone.dart';

class DailySpending {
  final int day;
  final double amount;
  final SpendingTone tone;

  const DailySpending({required this.day, required this.amount, required this.tone})
    : assert(day >= 1 && day <= 31, 'day deve estar entre 1 e 31'),
      assert(amount >= 0, 'amount não pode ser negativo');
}
