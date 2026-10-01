import 'package:flutter/material.dart';

import '../../domain/entities/day_progress.dart';
import 'package:lume/app/navigation/app_navigation.dart';
import 'package:lume/app/navigation/app_routes.dart';
import 'package:lume/core/modules/life_module.dart';
import '../styles/dashboard_labels.dart';
import 'life_module_tile.dart';

/// Grade de 3 colunas; módulos disponíveis ocupam 2 colunas para ganhar destaque.
class LifeModulesGrid extends StatelessWidget {
  static const int _columns = 3;
  static const double _gap = 12;

  final List<LifeModule> modules;
  final DayProgress dayProgress;

  const LifeModulesGrid({super.key, required this.modules, required this.dayProgress});

  @override
  Widget build(BuildContext context) {
    final rows = <List<LifeModule>>[];
    var current = <LifeModule>[];
    var used = 0;
    for (final module in modules) {
      final span = _span(module);
      if (used + span > _columns) {
        rows.add(current);
        current = [];
        used = 0;
      }
      current.add(module);
      used += span;
    }
    if (current.isNotEmpty) rows.add(current);

    return Column(
      children: [
        for (var r = 0; r < rows.length; r++) ...[
          if (r > 0) const SizedBox(height: _gap),
          _row(context, rows[r]),
        ],
      ],
    );
  }

  Widget _row(BuildContext context, List<LifeModule> row) {
    final used = row.fold<int>(0, (sum, m) => sum + _span(m));
    return Row(
      children: [
        for (var i = 0; i < row.length; i++) ...[
          if (i > 0) const SizedBox(width: _gap),
          Expanded(
            flex: _span(row[i]),
            child: LifeModuleTile(
              module: row[i],
              summary: DashboardLabels.moduleSummary(row[i], dayProgress),
              onTap: _pathFor(row[i]) == null
                  ? null
                  : () => AppNavigation.go(context, _pathFor(row[i])!),
            ),
          ),
        ],
        if (used < _columns) ...[const SizedBox(width: _gap), Spacer(flex: _columns - used)],
      ],
    );
  }

  int _span(LifeModule module) => module.isAvailable ? 2 : 1;

  String? _pathFor(LifeModule module) =>
      module.isAvailable ? AppRoutes.forModule(module.kind) : null;
}
