import 'package:intl/intl.dart';

abstract final class DurationFormatter {
  static final NumberFormat _hours = NumberFormat('#,##0.#', 'pt_BR');

  /// Arredonda para cima: 30s restantes ainda mostram "1 min", nunca "0 min" antes do fim.
  static String short(Duration duration) {
    if (duration <= Duration.zero) return '0 min';
    final minutes = (duration.inSeconds + 59) ~/ 60;
    if (minutes < 60) return '$minutes min';
    final hours = minutes ~/ 60;
    final rest = minutes % 60;
    if (rest == 0) return '${hours}h';
    return '${hours}h ${rest.toString().padLeft(2, '0')}min';
  }

  static String hours(double value) => '${_hours.format(value < 0 ? 0 : value)}h';
}
