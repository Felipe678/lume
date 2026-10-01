import 'package:flutter/material.dart';

import 'package:lume/core/theme/app_colors.dart';
import 'package:lume/core/theme/app_palette.dart';
import 'package:lume/core/widgets/brand_logo.dart';

import '../navigation/app_navigation.dart';
import '../navigation/modules_menu_route.dart';

class AppTopBar extends StatelessWidget {
  final bool compact;

  const AppTopBar({super.key, required this.compact});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Container(
      height: 64,
      color: colors.topBar,
      padding: EdgeInsets.symmetric(horizontal: compact ? 12 : 20),
      child: Row(
        children: [
          const BrandLogo(),
          if (compact)
            const Spacer()
          else ...[
            const SizedBox(width: 72),
            Expanded(child: _searchField(colors)),
          ],
          if (compact) _action(Icons.search_rounded, 'Buscar', colors),
          Builder(
            builder: (buttonContext) => _action(
              Icons.grid_view_outlined,
              'Módulos',
              colors,
              onPressed: () => _openModules(buttonContext),
            ),
          ),
          if (!compact) _action(Icons.bar_chart_rounded, 'Relatórios', colors),
          _action(Icons.notifications_none_rounded, 'Notificações', colors),
          SizedBox(width: compact ? 4 : 12),
          Semantics(
            label: 'Perfil',
            button: true,
            child: InkWell(
              onTap: () {},
              borderRadius: BorderRadius.circular(20),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const CircleAvatar(
                    radius: 16,
                    backgroundColor: AppPalette.orange,
                    child: Icon(Icons.person_rounded, size: 20, color: AppPalette.onCard),
                  ),
                  Icon(Icons.arrow_drop_down_rounded, color: colors.textMuted),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _searchField(AppColors colors) {
    return Align(
      alignment: Alignment.centerLeft,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 320),
        child: TextField(
          style: TextStyle(fontSize: 15, color: colors.textPrimary),
          cursorColor: colors.textPrimary,
          decoration: InputDecoration(
            isDense: true,
            border: InputBorder.none,
            hintText: 'Buscar',
            hintStyle: TextStyle(fontSize: 15, color: colors.textSecondary),
            prefixIcon: Icon(Icons.search_rounded, size: 20, color: colors.textSecondary),
            prefixIconConstraints: const BoxConstraints(minWidth: 30),
          ),
        ),
      ),
    );
  }

  void _openModules(BuildContext buttonContext) {
    final box = buttonContext.findRenderObject()! as RenderBox;
    final anchor = box.localToGlobal(Offset.zero) & box.size;
    Navigator.of(
      buttonContext,
    ).push(ModulesMenuRoute(anchor: anchor, currentPath: AppNavigation.currentPath(buttonContext)));
  }

  Widget _action(IconData icon, String tooltip, AppColors colors, {VoidCallback? onPressed}) {
    return IconButton(
      onPressed: onPressed ?? () {},
      tooltip: tooltip,
      visualDensity: compact ? VisualDensity.compact : VisualDensity.standard,
      icon: Icon(icon, size: 22, color: colors.textPrimary),
    );
  }
}
