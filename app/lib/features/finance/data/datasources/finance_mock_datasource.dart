import '../../domain/entities/card_brand.dart';
import '../../domain/entities/card_tone.dart';
import '../../domain/entities/card_transaction.dart';
import '../../domain/entities/category_spending.dart';
import '../../domain/entities/credit_card_summary.dart';
import '../../domain/entities/daily_spending.dart';
import '../../domain/entities/finance_snapshot.dart';
import '../../domain/entities/financial_metric.dart';
import '../../domain/entities/metric_kind.dart';
import '../../domain/entities/payment_card.dart';
import '../../domain/entities/recurring_expense.dart';
import '../../domain/entities/recurring_tone.dart';
import '../../domain/entities/spending_category.dart';
import '../../domain/entities/spending_tone.dart';
import '../../domain/entities/transaction_category.dart';

// Dados de exemplo até o módulo financeiro ter persistência real.
class FinanceMockDataSource {
  const FinanceMockDataSource();

  FinanceSnapshot load() {
    return FinanceSnapshot(
      card: const CreditCardSummary(
        bankName: 'OrionBank',
        productName: 'Cartão de crédito Platinum',
        title: 'Cartão de crédito universal',
        cardLabel: 'Cartão de compras',
        available: 21308,
        limit: 25000,
        card: PaymentCard(brand: CardBrand.visa, lastDigits: '2400', tone: CardTone.neutral),
      ),
      metrics: const [
        FinancialMetric(kind: MetricKind.income, amount: 41980, share: 0.67),
        FinancialMetric(kind: MetricKind.expense, amount: 24405, share: 0.54),
        FinancialMetric(kind: MetricKind.cashback, amount: 5919, share: 0.25),
      ],
      transactions: [
        CardTransaction(
          merchant: 'Apple Store',
          date: DateTime(2026, 9, 5),
          category: TransactionCategory.games,
          card: const PaymentCard(brand: CardBrand.visa, lastDigits: '4300', tone: CardTone.red),
          amount: 135,
        ),
        CardTransaction(
          merchant: 'Starbucks',
          date: DateTime(2026, 9, 4),
          category: TransactionCategory.cafe,
          card: const PaymentCard(brand: CardBrand.visa, lastDigits: '6589', tone: CardTone.blue),
          amount: 16.5,
        ),
        CardTransaction(
          merchant: 'Farmácia',
          date: DateTime(2026, 9, 4),
          category: TransactionCategory.health,
          card: const PaymentCard(
            brand: CardBrand.mastercard,
            lastDigits: '9054',
            tone: CardTone.neutral,
          ),
          amount: 58,
        ),
        CardTransaction(
          merchant: 'Spar',
          date: DateTime(2026, 9, 3),
          category: TransactionCategory.food,
          card: const PaymentCard(
            brand: CardBrand.visa,
            lastDigits: '3288',
            tone: CardTone.neutral,
          ),
          amount: 18,
        ),
      ],
      recurringExpenses: const [
        RecurringExpense(label: 'Treino', amount: 650, tone: RecurringTone.blue),
        RecurringExpense(label: 'Internet', amount: 45, tone: RecurringTone.yellow),
        RecurringExpense(label: 'Posto de gasolina', amount: 135, tone: RecurringTone.green),
        RecurringExpense(label: 'Cinema', amount: 15, tone: RecurringTone.orange),
        RecurringExpense(label: 'Roupas', amount: 700, tone: RecurringTone.mint),
        RecurringExpense(label: 'Café', amount: 50, tone: RecurringTone.purple),
      ],
      spendingTrend: const [
        DailySpending(day: 5, amount: 118, tone: SpendingTone.muted),
        DailySpending(day: 6, amount: 51, tone: SpendingTone.muted),
        DailySpending(day: 7, amount: 71, tone: SpendingTone.regular),
        DailySpending(day: 8, amount: 107, tone: SpendingTone.regular),
        DailySpending(day: 9, amount: 91, tone: SpendingTone.regular),
        DailySpending(day: 10, amount: 124, tone: SpendingTone.highlight),
        DailySpending(day: 11, amount: 138, tone: SpendingTone.highlight),
        DailySpending(day: 12, amount: 124, tone: SpendingTone.highlight),
        DailySpending(day: 13, amount: 67, tone: SpendingTone.regular),
        DailySpending(day: 14, amount: 91, tone: SpendingTone.regular),
        DailySpending(day: 15, amount: 107, tone: SpendingTone.regular),
        DailySpending(day: 16, amount: 69, tone: SpendingTone.regular),
        DailySpending(day: 17, amount: 71, tone: SpendingTone.muted),
      ],
      topCategories: const [
        CategorySpending(category: SpendingCategory.restaurants, amount: 4430),
        CategorySpending(category: SpendingCategory.subscriptions, amount: 190),
        CategorySpending(category: SpendingCategory.cafe, amount: 2401),
      ],
      monthOverMonthChange: 0.20,
    );
  }
}
