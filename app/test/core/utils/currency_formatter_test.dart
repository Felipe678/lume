import 'package:flutter_test/flutter_test.dart';
import 'package:lume/core/utils/currency_formatter.dart';

String _normalize(String value) => value.replaceAll(' ', ' ');

void main() {
  group('CurrencyFormatter', () {
    test('formata valores inteiros em reais', () {
      expect(_normalize(CurrencyFormatter.whole(21308)), r'R$ 21.308');
    });

    test('formata centavos no padrão brasileiro', () {
      expect(_normalize(CurrencyFormatter.cents(16.5)), r'R$ 16,50');
    });

    test('formata débito com sinal negativo', () {
      expect(_normalize(CurrencyFormatter.debit(135)), r'- R$ 135,00');
    });

    test('débito usa o valor absoluto', () {
      expect(_normalize(CurrencyFormatter.debit(-58)), r'- R$ 58,00');
    });

    test('formata zero', () {
      expect(_normalize(CurrencyFormatter.whole(0)), r'R$ 0');
    });
  });
}
