import 'package:intl/intl.dart';

abstract final class CurrencyFormatter {
  static final NumberFormat _whole = NumberFormat.currency(
    locale: 'pt_BR',
    symbol: r'R$',
    decimalDigits: 0,
  );
  static final NumberFormat _cents = NumberFormat.currency(
    locale: 'pt_BR',
    symbol: r'R$',
    decimalDigits: 2,
  );

  static String whole(double value) => _whole.format(value);

  static String cents(double value) => _cents.format(value);

  static String debit(double value) => '- ${_cents.format(value.abs())}';
}
