import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/category_spending.dart';
import '../../domain/entities/daily_spending.dart';
import '../styles/finance_labels.dart';
import '../../../../core/widgets/section_title.dart';
import 'spending_bar_chart.dart';
import 'top_category_tile.dart';

class SpendingTrendCard extends StatelessWidget {
  static const double width = 522;

  final List<DailySpending> trend;
  final List<CategorySpending> topCategories;
  final double monthOverMonthChange;

  const SpendingTrendCard({
    super.key,
    required this.trend,
    required this.topCategories,
    required this.monthOverMonthChange,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Container(
      padding: const EdgeInsets.all(26),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.35),
            blurRadius: 40,
            offset: const Offset(0, 16),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionTitle('Tendência de gastos'),
          const SizedBox(height: 16),
          SpendingBarChart(points: trend),
          const SizedBox(height: 32),
          Text(
            'Principais categorias do mês',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: colors.textPrimary),
          ),
          const SizedBox(height: 6),
          Text(
            FinanceLabels.monthOverMonth(monthOverMonthChange),
            style: TextStyle(fontSize: 13, color: colors.textSecondary),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              for (var i = 0; i < topCategories.length; i++) ...[
                if (i > 0) const SizedBox(width: 12),
                Expanded(child: TopCategoryTile(spending: topCategories[i])),
              ],
            ],
          ),
        ],
      ),
    );
  }
}
