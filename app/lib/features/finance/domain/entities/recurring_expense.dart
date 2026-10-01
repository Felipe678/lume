import 'recurring_tone.dart';

class RecurringExpense {
  final String label;
  final double amount;
  final RecurringTone tone;

  const RecurringExpense({required this.label, required this.amount, required this.tone})
    : assert(amount >= 0, 'amount não pode ser negativo');
}
