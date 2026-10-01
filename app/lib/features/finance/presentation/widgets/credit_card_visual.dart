import 'package:flutter/material.dart';

import '../../../../core/theme/app_palette.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../domain/entities/card_brand.dart';
import '../../domain/entities/credit_card_summary.dart';
import 'card_chip.dart';

class CreditCardVisual extends StatelessWidget {
  static const double width = 330;
  static const double height = 200;

  final CreditCardSummary summary;

  const CreditCardVisual({super.key, required this.summary});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: width),
      child: AspectRatio(
        aspectRatio: width / height,
        child: Semantics(
          label:
              '${summary.cardLabel} final ${summary.card.lastDigits}, '
              'disponível ${CurrencyFormatter.whole(summary.available)} '
              'de ${CurrencyFormatter.whole(summary.limit)}',
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: AppPalette.cardGradient,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppPalette.cardBorder),
              boxShadow: [
                BoxShadow(
                  color: AppPalette.cardGlow.withValues(alpha: 0.35),
                  blurRadius: 48,
                  offset: const Offset(0, 14),
                ),
              ],
            ),
            child: Padding(
              padding: const EdgeInsets.all(22),
              child: Stack(
                children: [
                  _content(),
                  Positioned(right: 0, top: 0, child: _brandMark(summary.card.brand)),
                  const Align(
                    alignment: Alignment(1, 0.15),
                    child: SizedBox(width: 42, height: 36, child: CardChip()),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _content() {
    const onCard = AppPalette.cardForeground;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        FittedBox(
          fit: BoxFit.scaleDown,
          child: Text(
            CurrencyFormatter.whole(summary.available),
            style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: onCard),
          ),
        ),
        const SizedBox(height: 16),
        const Text(
          'Limite de crédito',
          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: onCard),
        ),
        const SizedBox(height: 4),
        Text(
          CurrencyFormatter.whole(summary.limit),
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: onCard),
        ),
        const Spacer(),
        Text(
          '${summary.cardLabel} ****${summary.card.lastDigits}',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: onCard),
        ),
      ],
    );
  }

  Widget _brandMark(CardBrand brand) {
    return Text(
      switch (brand) {
        CardBrand.visa => 'VISA',
        CardBrand.mastercard => 'mastercard',
      },
      style: const TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.w900,
        fontStyle: FontStyle.italic,
        letterSpacing: -0.5,
        color: AppPalette.cardForeground,
      ),
    );
  }
}
