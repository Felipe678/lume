import 'package:lume/core/modules/life_module_kind.dart';

abstract final class AppRoutes {
  static const String overview = '/';
  static const String time = '/tempo';

  /// Rota do módulo, ou null enquanto ele não tem tela.
  static String? forModule(LifeModuleKind kind) => switch (kind) {
    LifeModuleKind.time => time,
    LifeModuleKind.health ||
    LifeModuleKind.finance ||
    LifeModuleKind.assets ||
    LifeModuleKind.documents => null,
  };
}
