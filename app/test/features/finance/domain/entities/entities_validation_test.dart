import 'package:flutter_test/flutter_test.dart';
import 'package:lume/features/finance/domain/entities/card_brand.dart';
import 'package:lume/features/finance/domain/entities/card_tone.dart';
import 'package:lume/features/finance/domain/entities/daily_spending.dart';
import 'package:lume/features/finance/domain/entities/financial_metric.dart';
import 'package:lume/features/finance/domain/entities/metric_kind.dart';
import 'package:lume/features/finance/domain/entities/payment_card.dart';
import 'package:lume/features/finance/domain/entities/spending_tone.dart';

void main() {
  group('Validação das entidades do dashboard', () {
    test('PaymentCard rejeita final com tamanho diferente de 4', () {
      expect(
        () => PaymentCard(brand: CardBrand.visa, lastDigits: '123', tone: CardTone.red),
        throwsA(isA<AssertionError>()),
      );
    });

    test('FinancialMetric rejeita participação acima de 100%', () {
      expect(
        () => FinancialMetric(kind: MetricKind.income, amount: 10, share: 1.1),
        throwsA(isA<AssertionError>()),
      );
    });

    test('FinancialMetric rejeita valor negativo', () {
      expect(
        () => FinancialMetric(kind: MetricKind.expense, amount: -1, share: 0.5),
        throwsA(isA<AssertionError>()),
      );
    });

    test('DailySpending rejeita dia fora do mês', () {
      expect(
        () => DailySpending(day: 32, amount: 10, tone: SpendingTone.regular),
        throwsA(isA<AssertionError>()),
      );
    });
  });
}
