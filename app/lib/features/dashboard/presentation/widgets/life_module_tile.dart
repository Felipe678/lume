import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_palette.dart';
import 'package:lume/core/modules/life_module.dart';
import 'package:lume/core/modules/life_module_style.dart';

class LifeModuleTile extends StatelessWidget {
  final LifeModule module;
  final String summary;
  final VoidCallback? onTap;

  const LifeModuleTile({super.key, required this.module, required this.summary, this.onTap});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final name = LifeModuleStyle.name(module.kind);
    final available = module.isAvailable;

    final tile = Container(
      constraints: const BoxConstraints(minHeight: 112),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: colors.surfaceRaised,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: available ? AppPalette.violet : colors.background,
              borderRadius: BorderRadius.circular(9),
            ),
            child: Icon(
              LifeModuleStyle.icon(module.kind),
              size: 20,
              color: available ? Colors.white : colors.textMuted,
            ),
          ),
          const SizedBox(height: 16),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(
              name,
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
            child: Text(summary, style: TextStyle(fontSize: 12, color: colors.textMuted)),
          ),
        ],
      ),
    );

    return Semantics(
      label: '$name, $summary',
      button: available,
      enabled: available,
      excludeSemantics: true,
      child: available
          ? Material(
              type: MaterialType.transparency,
              child: InkWell(onTap: onTap, borderRadius: BorderRadius.circular(12), child: tile),
            )
          : tile,
    );
  }
}
