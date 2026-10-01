import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/content_width.dart';
import '../../domain/entities/finance_snapshot.dart';
import 'card_header.dart';
import 'credit_card_visual.dart';
import 'last_transactions_section.dart';
import 'metric_rings_wrap.dart';
import 'recurring_expenses_section.dart';
import 'spending_trend_card.dart';

class FinanceWideLayout extends StatelessWidget {
  static const double _bandOverlap = 48;

  final FinanceSnapshot snapshot;

  const FinanceWideLayout({super.key, required this.snapshot});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        ColoredBox(
          color: colors.heroBand,
          child: ContentWidth(
            child: Padding(
              padding: const EdgeInsets.only(top: 48, bottom: _bandOverlap),
              child: _hero(),
            ),
          ),
        ),
        ContentWidth(
          child: Padding(padding: const EdgeInsets.only(bottom: 48), child: _body()),
        ),
      ],
    );
  }

  Widget _hero() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: CreditCardVisual.width,
          child: CreditCardVisual(summary: snapshot.card),
        ),
        const SizedBox(width: 40),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CardHeader(summary: snapshot.card, compact: false),
                const SizedBox(height: 30),
                MetricRingsWrap(metrics: snapshot.metrics, compact: false),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // O card de tendência sobe para cruzar a faixa do topo, como no design.
  Widget _body() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(top: 86 - _bandOverlap),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                LastTransactionsSection(transactions: snapshot.transactions, compact: false),
                const SizedBox(height: 56),
                RecurringExpensesSection(expenses: snapshot.recurringExpenses),
              ],
            ),
          ),
        ),
        const SizedBox(width: 48),
        SizedBox(
          width: SpendingTrendCard.width,
          child: Transform.translate(
            offset: const Offset(0, -_bandOverlap),
            child: SpendingTrendCard(
              trend: snapshot.spendingTrend,
              topCategories: snapshot.topCategories,
              monthOverMonthChange: snapshot.monthOverMonthChange,
            ),
          ),
        ),
      ],
    );
  }
}
