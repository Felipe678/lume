import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/credit_card_summary.dart';

class CardHeader extends StatelessWidget {
  final CreditCardSummary summary;
  final bool compact;

  const CardHeader({super.key, required this.summary, required this.compact});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final eyebrow = TextStyle(fontSize: 15, fontWeight: FontWeight.w500, color: colors.textPrimary);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text.rich(
          TextSpan(
            children: [
              TextSpan(text: summary.bankName),
              TextSpan(
                text: '   ·   ',
                style: TextStyle(color: colors.textSecondary),
              ),
              TextSpan(text: summary.productName),
            ],
          ),
          style: eyebrow,
        ),
        const SizedBox(height: 6),
        Text(
          summary.title,
          style: TextStyle(
            fontSize: compact ? 28 : 36,
            fontWeight: FontWeight.w700,
            letterSpacing: -0.6,
            height: 1.15,
            color: colors.textPrimary,
          ),
        ),
      ],
    );
  }
}
