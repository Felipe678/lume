import 'package:flutter_test/flutter_test.dart';
import 'package:lume/features/finance/presentation/styles/finance_labels.dart';

void main() {
  group('FinanceLabels.monthOverMonth', () {
    test('descreve aumento de gastos', () {
      expect(
        FinanceLabels.monthOverMonth(0.20),
        'Neste mês seus gastos foram 20% maiores que no mês passado',
      );
    });

    test('descreve redução de gastos', () {
      expect(
        FinanceLabels.monthOverMonth(-0.15),
        'Neste mês seus gastos foram 15% menores que no mês passado',
      );
    });

    test('descreve gastos estáveis', () {
      expect(
        FinanceLabels.monthOverMonth(0.001),
        'Neste mês seus gastos ficaram iguais aos do mês passado',
      );
    });
  });
}
