import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_palette.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/widgets/bar_chart.dart';
import '../../../../core/widgets/bar_chart_entry.dart';
import '../../domain/entities/daily_spending.dart';
import '../../domain/entities/spending_tone.dart';
import '../styles/finance_visuals.dart';

class SpendingBarChart extends StatelessWidget {
  final List<DailySpending> points;

  const SpendingBarChart({super.key, required this.points});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return BarChart(
      emptyMessage: 'Sem gastos no período',
      entries: [
        for (final point in points)
          BarChartEntry(
            label: '${point.day}',
            value: point.amount,
            color: FinanceVisuals.spendingBar(point.tone, colors),
            labelColor: point.tone == SpendingTone.highlight ? AppPalette.cyan : colors.textMuted,
            glow: point.tone == SpendingTone.highlight,
            tooltip: 'Dia ${point.day}: ${CurrencyFormatter.cents(point.amount)}',
          ),
      ],
    );
  }
}
