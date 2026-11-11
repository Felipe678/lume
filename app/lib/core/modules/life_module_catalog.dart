import 'life_module.dart';
import 'life_module_kind.dart';
import 'module_availability.dart';

/// Fonte única dos módulos do ERP e da entrega do roadmap que libera cada um.
abstract final class LifeModuleCatalog {
  static const List<LifeModule> all = [
    LifeModule(kind: LifeModuleKind.time, availability: ModuleAvailability.available),
    LifeModule(
      kind: LifeModuleKind.health,
      availability: ModuleAvailability.comingSoon,
      roadmapStage: 'E2',
    ),
    LifeModule(
      kind: LifeModuleKind.finance,
      availability: ModuleAvailability.comingSoon,
      roadmapStage: 'E5',
    ),
    LifeModule(
      kind: LifeModuleKind.assets,
      availability: ModuleAvailability.comingSoon,
      roadmapStage: 'E6',
    ),
    LifeModule(
      kind: LifeModuleKind.documents,
      availability: ModuleAvailability.comingSoon,
      roadmapStage: 'E7',
    ),
  ];
}
