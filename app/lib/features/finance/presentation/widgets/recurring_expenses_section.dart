import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/recurring_expense.dart';
import 'recurring_expense_chip.dart';
import '../../../../core/widgets/section_title.dart';

class RecurringExpensesSection extends StatelessWidget {
  final List<RecurringExpense> expenses;

  const RecurringExpensesSection({super.key, required this.expenses});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionTitle('Transações periódicas'),
        const SizedBox(height: 18),
        if (expenses.isEmpty)
          Text(
            'Nenhuma transação periódica cadastrada',
            style: TextStyle(fontSize: 13, color: AppColors.of(context).textSecondary),
          )
        else
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [for (final e in expenses) RecurringExpenseChip(expense: e)],
          ),
      ],
    );
  }
}
