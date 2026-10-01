import 'package:flutter/material.dart';

import '../../domain/entities/financial_metric.dart';
import 'metric_ring_tile.dart';

class MetricRingsWrap extends StatelessWidget {
  final List<FinancialMetric> metrics;
  final bool compact;

  const MetricRingsWrap({super.key, required this.metrics, required this.compact});

  @override
  Widget build(BuildContext context) {
    if (compact) {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (final m in metrics) Expanded(child: MetricRingTile(metric: m, compact: true)),
        ],
      );
    }
    return Wrap(
      spacing: 36,
      runSpacing: 24,
      children: [for (final m in metrics) MetricRingTile(metric: m, compact: false)],
    );
  }
}
