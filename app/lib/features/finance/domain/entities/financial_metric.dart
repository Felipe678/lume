import 'metric_kind.dart';

class FinancialMetric {
  final MetricKind kind;
  final double amount;
  final double share;

  const FinancialMetric({required this.kind, required this.amount, required this.share})
    : assert(amount >= 0, 'amount não pode ser negativo'),
      assert(share >= 0 && share <= 1, 'share deve estar entre 0 e 1');
}
