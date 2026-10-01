import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../domain/entities/card_transaction.dart';
import '../styles/finance_visuals.dart';
import 'card_brand_badge.dart';

class TransactionRow extends StatelessWidget {
  static final DateFormat _dateFormat = DateFormat('dd/MM/yyyy');

  final CardTransaction transaction;
  final bool compact;

  const TransactionRow({super.key, required this.transaction, required this.compact});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final details = TextStyle(fontSize: 11, color: colors.textMuted);
    final merchant = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          transaction.merchant,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: colors.textPrimary),
        ),
        const SizedBox(height: 2),
        Text(_dateFormat.format(transaction.date), style: details),
      ],
    );

    return Row(
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(color: colors.iconTile, borderRadius: BorderRadius.circular(7)),
          child: Icon(
            FinanceVisuals.transactionIcon(transaction.category),
            size: 16,
            color: colors.textPrimary,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(child: merchant),
        const SizedBox(width: 8),
        CardBrandBadge(card: transaction.card),
        if (!compact) ...[
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('*${transaction.card.lastDigits}', style: details),
              Text('Cartão de crédito', style: details),
            ],
          ),
        ],
        SizedBox(
          width: compact ? 112 : 124,
          child: Align(
            alignment: Alignment.centerRight,
            child: FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(
                CurrencyFormatter.debit(transaction.amount),
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: colors.textPrimary,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
