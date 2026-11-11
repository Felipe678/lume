import 'card_brand.dart';
import 'card_tone.dart';

class PaymentCard {
  final CardBrand brand;
  final String lastDigits;
  final CardTone tone;

  const PaymentCard({required this.brand, required this.lastDigits, required this.tone})
    : assert(lastDigits.length == 4, 'lastDigits deve ter 4 dígitos');
}
