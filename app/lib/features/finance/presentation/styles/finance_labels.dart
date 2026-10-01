import '../../domain/entities/metric_kind.dart';
import '../../domain/entities/spending_category.dart';

abstract final class FinanceLabels {
  static String metric(MetricKind kind) => switch (kind) {
    MetricKind.income => 'Receita',
    MetricKind.expense => 'Despesa',
    MetricKind.cashback => 'Cashback',
  };

  static String spendingCategory(SpendingCategory category) => switch (category) {
    SpendingCategory.restaurants => 'Restaurantes',
    SpendingCategory.subscriptions => 'Assinaturas',
    SpendingCategory.cafe => 'Café',
  };

  static String monthOverMonth(double change) {
    final percent = (change.abs() * 100).round();
    if (percent == 0) return 'Neste mês seus gastos ficaram iguais aos do mês passado';
    final direction = change > 0 ? 'maiores' : 'menores';
    return 'Neste mês seus gastos foram $percent% $direction que no mês passado';
  }
}
