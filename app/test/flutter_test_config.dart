import 'dart:async';

import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:intl/intl.dart';

// Carrega a Inter real para que as medições de layout nos testes batam com o app.
Future<void> testExecutable(FutureOr<void> Function() testMain) async {
  TestWidgetsFlutterBinding.ensureInitialized();
  final inter = FontLoader('Inter');
  for (final weight in ['400', '500', '600', '700', '800']) {
    inter.addFont(rootBundle.load('assets/fonts/Inter-$weight.ttf'));
  }
  inter.addFont(rootBundle.load('assets/fonts/Inter-900-italic.ttf'));
  await inter.load();
  Intl.defaultLocale = 'pt_BR';
  await initializeDateFormatting('pt_BR');
  await testMain();
}
