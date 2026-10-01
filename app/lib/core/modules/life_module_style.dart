import 'package:flutter/material.dart';

import 'life_module_kind.dart';

abstract final class LifeModuleStyle {
  static String name(LifeModuleKind kind) => switch (kind) {
    LifeModuleKind.time => 'Tempo e objetivos',
    LifeModuleKind.health => 'Saúde',
    LifeModuleKind.finance => 'Finanças',
    LifeModuleKind.assets => 'Patrimônio',
    LifeModuleKind.documents => 'Documentos',
  };

  static IconData icon(LifeModuleKind kind) => switch (kind) {
    LifeModuleKind.time => Icons.schedule_rounded,
    LifeModuleKind.health => Icons.favorite_rounded,
    LifeModuleKind.finance => Icons.account_balance_wallet_rounded,
    LifeModuleKind.assets => Icons.home_work_rounded,
    LifeModuleKind.documents => Icons.description_rounded,
  };
}
