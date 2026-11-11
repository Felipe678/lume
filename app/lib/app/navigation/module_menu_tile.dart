import 'package:flutter/material.dart';
import 'package:lume/core/theme/app_colors.dart';
import 'package:lume/core/theme/app_palette.dart';

import 'module_menu_entry.dart';

class ModuleMenuTile extends StatelessWidget {
  final ModuleMenuEntry entry;
  final bool selected;
  final bool autofocus;
  final VoidCallback onOpen;

  const ModuleMenuTile({
    super.key,
    required this.entry,
    required this.selected,
    required this.autofocus,
    required this.onOpen,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final available = entry.isAvailable;
    final status = selected
        ? 'Aberto agora'
        : available
        ? 'Disponível'
        : 'Em breve · ${entry.roadmapStage}';

    final content = Container(
      constraints: const BoxConstraints(minHeight: 96),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: colors.surfaceRaised,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: selected ? AppPalette.violet : Colors.transparent, width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: available ? AppPalette.violet : colors.background,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  entry.icon,
                  size: 20,
                  color: available ? Colors.white : colors.textMuted,
                ),
              ),
              const Spacer(),
              if (selected)
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(color: AppPalette.cyan, shape: BoxShape.circle),
                ),
            ],
          ),
          const SizedBox(height: 14),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(
              entry.title,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: available ? colors.textPrimary : colors.textSecondary,
              ),
            ),
          ),
          const SizedBox(height: 2),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(status, style: TextStyle(fontSize: 12, color: colors.textMuted)),
          ),
        ],
      ),
    );

    return Semantics(
      label: '${entry.title}, $status',
      button: true,
      enabled: available,
      selected: selected,
      excludeSemantics: true,
      child: Material(
        type: MaterialType.transparency,
        child: InkWell(
          autofocus: autofocus,
          onTap: available ? onOpen : null,
          borderRadius: BorderRadius.circular(14),
          child: content,
        ),
      ),
    );
  }
}
