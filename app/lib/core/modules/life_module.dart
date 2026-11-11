import 'package:lume/core/modules/life_module_kind.dart';
import 'package:lume/core/modules/module_availability.dart';

class LifeModule {
  final LifeModuleKind kind;
  final ModuleAvailability availability;

  /// Entrega do roadmap que libera o módulo (ex.: "E2").
  final String? roadmapStage;

  const LifeModule({required this.kind, required this.availability, this.roadmapStage})
    : assert(
        availability == ModuleAvailability.available || roadmapStage != null,
        'módulo em breve precisa da entrega do roadmap',
      );

  bool get isAvailable => availability == ModuleAvailability.available;
}
