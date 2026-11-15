import 'dart:convert';
import 'dart:io';
import 'dart:ui';

/// Caminho do `tokens.json` a partir do cwd de `app/` (onde `flutter test` roda).
String get _tokensPath =>
    '${Directory.current.path}${Platform.pathSeparator}..${Platform.pathSeparator}docs${Platform.pathSeparator}design-system${Platform.pathSeparator}tokens.json';

/// Converte `#RRGGBB` ou `#RRGGBBAA` em `Color`. No CSS o alpha vem no fim;
/// no Dart ele vem no início (`0xAARRGGBB`).
Color parseHex(String hex) {
  final h = hex.startsWith('#') ? hex.substring(1) : hex;
  if (h.length != 6 && h.length != 8) {
    throw FormatException('Cor inválida no tokens.json: "$hex"');
  }
  final rgb = h.substring(0, 6);
  final alpha = h.length == 8 ? h.substring(6, 8) : 'ff';
  return Color(int.parse('$alpha$rgb', radix: 16));
}

/// Tokens de cor do `tokens.json`: nome -> String ou Map `{dark, light}`.
/// Falha com mensagem clara se o arquivo não existir (sem `skip`).
Map<String, Object> loadColorTokens() {
  final file = File(_tokensPath);
  if (!file.existsSync()) {
    throw StateError(
      'tokens.json não encontrado em "$_tokensPath". '
      'Rode os testes a partir de app/ (flutter test) com o DS em docs/design-system.',
    );
  }
  final json = jsonDecode(file.readAsStringSync()) as Map<String, dynamic>;
  final tokens = (json['color'] as Map<String, dynamic>)['tokens'] as List;
  return {
    for (final t in tokens)
      (t as Map<String, dynamic>)['name'] as String: t['value'] as Object,
  };
}

/// Cor de um valor que pode ser String (fixo) ou Map `{dark, light}` (por tema).
Color colorOf(Object value, {String theme = 'dark'}) {
  if (value is String) return parseHex(value);
  if (value is Map) return parseHex(value[theme] as String);
  throw FormatException('Valor de token inesperado: $value');
}

/// `true` quando o valor tem variação por tema.
bool isThemed(Object value) => value is Map;
