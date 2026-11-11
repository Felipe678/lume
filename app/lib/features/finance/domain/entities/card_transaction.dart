import 'payment_card.dart';
import 'transaction_category.dart';

class CardTransaction {
  final String merchant;
  final DateTime date;
  final TransactionCategory category;
  final PaymentCard card;
  final double amount;

  const CardTransaction({
    required this.merchant,
    required this.date,
    required this.category,
    required this.card,
    required this.amount,
  }) : assert(amount >= 0, 'amount não pode ser negativo');
}
