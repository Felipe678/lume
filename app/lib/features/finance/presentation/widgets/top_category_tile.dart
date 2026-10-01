import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../domain/entities/category_spending.dart';
import '../styles/finance_labels.dart';
import '../styles/finance_visuals.dart';

class TopCategoryTile extends StatelessWidget {
  final CategorySpending spending;

  const TopCategoryTile({super.key, required this.spending});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final label = FinanceLabels.spendingCategory(spending.category);
    final amount = CurrencyFormatter.whole(spending.amount);

    return Semantics(
      label: '$label: $amount',
      excludeSemantics: true,
      child: Container(
        constraints: const BoxConstraints(minHeight: 140),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: colors.surfaceRaised,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: FinanceVisuals.spendingCategoryWell(spending.category, colors),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                FinanceVisuals.spendingCategoryIcon(spending.category),
                size: 22,
                color: FinanceVisuals.spendingCategoryIconColor(spending.category),
              ),
            ),
            const SizedBox(height: 28),
            FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.centerLeft,
              child: Text(label, style: TextStyle(fontSize: 13, color: colors.textSecondary)),
            ),
            const SizedBox(height: 4),
            FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.centerLeft,
              child: Text(
                amount,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: colors.textPrimary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
