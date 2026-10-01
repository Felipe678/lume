import 'payment_card.dart';

class CreditCardSummary {
  final String bankName;
  final String productName;
  final String title;
  final String cardLabel;
  final double available;
  final double limit;
  final PaymentCard card;

  const CreditCardSummary({
    required this.bankName,
    required this.productName,
    required this.title,
    required this.cardLabel,
    required this.available,
    required this.limit,
    required this.card,
  }) : assert(limit >= 0, 'limit não pode ser negativo'),
       assert(available >= 0 && available <= limit, 'available deve estar entre 0 e limit');
}
