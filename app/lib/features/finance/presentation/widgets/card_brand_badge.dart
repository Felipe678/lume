import 'package:flutter/material.dart';

import '../../domain/entities/card_brand.dart';
import '../../domain/entities/payment_card.dart';
import '../styles/finance_visuals.dart';
import 'mastercard_mark.dart';

class CardBrandBadge extends StatelessWidget {
  final PaymentCard card;

  const CardBrandBadge({super.key, required this.card});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 38,
      height: 22,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: FinanceVisuals.cardTone(card.tone),
        borderRadius: BorderRadius.circular(5),
      ),
      child: switch (card.brand) {
        CardBrand.visa => const Text(
          'VISA',
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w900,
            fontStyle: FontStyle.italic,
            color: Colors.white,
          ),
        ),
        CardBrand.mastercard => const MastercardMark(),
      },
    );
  }
}
