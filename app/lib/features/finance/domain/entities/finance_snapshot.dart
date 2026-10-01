import 'card_transaction.dart';
import 'category_spending.dart';
import 'credit_card_summary.dart';
import 'daily_spending.dart';
import 'financial_metric.dart';
import 'recurring_expense.dart';

class FinanceSnapshot {
  final CreditCardSummary card;
  final List<FinancialMetric> metrics;
  final List<CardTransaction> transactions;
  final List<RecurringExpense> recurringExpenses;
  final List<DailySpending> spendingTrend;
  final List<CategorySpending> topCategories;
  final double monthOverMonthChange;

  const FinanceSnapshot({
    required this.card,
    required this.metrics,
    required this.transactions,
    required this.recurringExpenses,
    required this.spendingTrend,
    required this.topCategories,
    required this.monthOverMonthChange,
  });
}
