import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../domain/entities/recurring_expense.dart';
import '../styles/finance_visuals.dart';

class RecurringExpenseChip extends StatelessWidget {
  final RecurringExpense expense;

  const RecurringExpenseChip({super.key, required this.expense});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Container(
      height: 34,
      padding: const EdgeInsets.symmetric(horizontal: 14),
      decoration: BoxDecoration(color: colors.chip, borderRadius: BorderRadius.circular(17)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: FinanceVisuals.recurring(expense.tone),
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 8),
          Text(
            expense.label,
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: colors.textPrimary),
          ),
          const SizedBox(width: 8),
          Text(
            CurrencyFormatter.whole(expense.amount),
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: colors.textPrimary),
          ),
        ],
      ),
    );
  }
}
