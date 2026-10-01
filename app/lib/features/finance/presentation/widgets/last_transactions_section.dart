import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/card_transaction.dart';
import '../../../../core/widgets/section_title.dart';
import 'transaction_row.dart';

class LastTransactionsSection extends StatelessWidget {
  final List<CardTransaction> transactions;
  final bool compact;

  const LastTransactionsSection({super.key, required this.transactions, required this.compact});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionTitle('Últimas transações'),
        const SizedBox(height: 20),
        if (transactions.isEmpty)
          Text(
            'Nenhuma transação ainda',
            style: TextStyle(fontSize: 13, color: AppColors.of(context).textSecondary),
          )
        else
          for (var i = 0; i < transactions.length; i++)
            Padding(
              padding: EdgeInsets.only(top: i == 0 ? 0 : 20),
              child: TransactionRow(transaction: transactions[i], compact: compact),
            ),
      ],
    );
  }
}
