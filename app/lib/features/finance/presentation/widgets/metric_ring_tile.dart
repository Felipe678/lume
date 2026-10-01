import 'package:flutter/material.dart';

import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/widgets/ring_stat_tile.dart';
import '../../domain/entities/financial_metric.dart';
import '../styles/finance_labels.dart';
import '../styles/finance_visuals.dart';

class MetricRingTile extends StatelessWidget {
  final FinancialMetric metric;
  final bool compact;

  const MetricRingTile({super.key, required this.metric, required this.compact});

  @override
  Widget build(BuildContext context) {
    return RingStatTile(
      progress: metric.share,
      centerLabel: '${(metric.share * 100).round()}%',
      value: CurrencyFormatter.whole(metric.amount),
      label: FinanceLabels.metric(metric.kind),
      accent: FinanceVisuals.metric(metric.kind),
      compact: compact,
    );
  }
}
