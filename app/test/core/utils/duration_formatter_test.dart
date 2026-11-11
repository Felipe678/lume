import 'package:flutter_test/flutter_test.dart';
import 'package:lume/core/utils/duration_formatter.dart';

void main() {
  group('DurationFormatter.short', () {
    test('minutos', () => expect(DurationFormatter.short(const Duration(minutes: 42)), '42 min'));

    test('hora cheia', () => expect(DurationFormatter.short(const Duration(hours: 1)), '1h'));

    test('hora e minutos com zero à esquerda', () {
      expect(DurationFormatter.short(const Duration(hours: 1, minutes: 5)), '1h 05min');
    });

    test('arredonda segundos para cima', () {
      expect(DurationFormatter.short(const Duration(seconds: 30)), '1 min');
      expect(DurationFormatter.short(const Duration(minutes: 41, seconds: 1)), '42 min');
    });

    test('zero e negativo viram 0 min', () {
      expect(DurationFormatter.short(Duration.zero), '0 min');
      expect(DurationFormatter.short(const Duration(minutes: -5)), '0 min');
    });
  });

  group('DurationFormatter.hours', () {
    test('decimal com vírgula', () => expect(DurationFormatter.hours(2.5), '2,5h'));

    test('inteiro sem casa decimal', () => expect(DurationFormatter.hours(3), '3h'));

    test('negativo vira zero', () => expect(DurationFormatter.hours(-1), '0h'));
  });
}
