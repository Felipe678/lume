import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lume/core/theme/app_colors.dart';

import 'module_menu_entry.dart';
import 'module_menu_tile.dart';

class ModulesMenuPanel extends StatelessWidget {
  static const int _columns = 2;
  static const double _gap = 10;

  final String? currentPath;

  const ModulesMenuPanel({super.key, required this.currentPath});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final entries = ModuleMenuEntry.all();
    final focusIndex = entries.indexWhere((e) => e.isAvailable);

    return Semantics(
      scopesRoute: true,
      namesRoute: true,
      explicitChildNodes: true,
      label: 'Módulos',
      child: Material(
        color: colors.surface,
        borderRadius: BorderRadius.circular(20),
        clipBehavior: Clip.antiAlias,
        shadowColor: Colors.black,
        elevation: 24,
        child: DecoratedBox(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: colors.divider),
          ),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Módulos',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: colors.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Cada área da sua vida',
                  style: TextStyle(fontSize: 13, color: colors.textSecondary),
                ),
                const SizedBox(height: 16),
                for (var start = 0; start < entries.length; start += _columns) ...[
                  if (start > 0) const SizedBox(height: _gap),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      for (var i = start; i < start + _columns; i++) ...[
                        if (i > start) const SizedBox(width: _gap),
                        Expanded(
                          child: i < entries.length
                              ? ModuleMenuTile(
                                  entry: entries[i],
                                  selected: entries[i].path == currentPath,
                                  autofocus: i == focusIndex,
                                  onOpen: () => _open(context, entries[i]),
                                )
                              : const SizedBox.shrink(),
                        ),
                      ],
                    ],
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _open(BuildContext context, ModuleMenuEntry entry) {
    final router = GoRouter.maybeOf(context);
    Navigator.of(context).pop();
    if (entry.path != currentPath) router?.go(entry.path!);
  }
}
