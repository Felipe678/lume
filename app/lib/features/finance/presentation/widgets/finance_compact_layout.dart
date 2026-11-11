import 'package:flutter/material.dart';

import '../../../../core/constants/breakpoints.dart';
import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/finance_snapshot.dart';
import 'card_header.dart';
import 'credit_card_visual.dart';
import 'last_transactions_section.dart';
import 'metric_rings_wrap.dart';
import 'recurring_expenses_section.dart';
import 'spending_trend_card.dart';

class FinanceCompactLayout extends StatelessWidget {
  final FinanceSnapshot snapshot;

  const FinanceCompactLayout({super.key, required this.snapshot});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        ColoredBox(
          color: colors.heroBand,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(
              Breakpoints.pagePaddingCompact,
              24,
              Breakpoints.pagePaddingCompact,
              32,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CreditCardVisual(summary: snapshot.card),
                const SizedBox(height: 28),
                CardHeader(summary: snapshot.card, compact: true),
                const SizedBox(height: 24),
                MetricRingsWrap(metrics: snapshot.metrics, compact: true),
              ],
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(
            Breakpoints.pagePaddingCompact,
            32,
            Breakpoints.pagePaddingCompact,
            40,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SpendingTrendCard(
                trend: snapshot.spendingTrend,
                topCategories: snapshot.topCategories,
                monthOverMonthChange: snapshot.monthOverMonthChange,
              ),
              const SizedBox(height: 40),
              LastTransactionsSection(transactions: snapshot.transactions, compact: true),
              const SizedBox(height: 40),
              RecurringExpensesSection(expenses: snapshot.recurringExpenses),
            ],
          ),
        ),
      ],
    );
  }
}
