import 'package:flutter/material.dart';
import 'package:lume/core/modules/life_module_catalog.dart';
import 'package:lume/core/modules/life_module_style.dart';

import 'app_routes.dart';

class ModuleMenuEntry {
  final String title;
  final IconData icon;

  /// Null enquanto o módulo não tem tela.
  final String? path;
  final String? roadmapStage;

  const ModuleMenuEntry({required this.title, required this.icon, this.path, this.roadmapStage})
    : assert(path != null || roadmapStage != null, 'entrada sem tela precisa da entrega');

  bool get isAvailable => path != null;

  static List<ModuleMenuEntry> all() => [
    const ModuleMenuEntry(
      title: 'Visão geral',
      icon: Icons.space_dashboard_rounded,
      path: AppRoutes.overview,
    ),
    for (final module in LifeModuleCatalog.all)
      ModuleMenuEntry(
        title: LifeModuleStyle.name(module.kind),
        icon: LifeModuleStyle.icon(module.kind),
        path: module.isAvailable ? AppRoutes.forModule(module.kind) : null,
        roadmapStage: module.roadmapStage,
      ),
  ];
}
