import 'package:flutter/material.dart';

import 'package:lume/core/constants/breakpoints.dart';
import 'package:lume/core/theme/app_colors.dart';

class AppFooter extends StatelessWidget {
  final double horizontalPadding;

  const AppFooter({super.key, required this.horizontalPadding});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Column(
      children: [
        Divider(height: 1, thickness: 1, color: colors.divider),
        SizedBox(
          height: 40,
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: Breakpoints.contentMaxWidth),
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    '© 2026 Lume',
                    style: TextStyle(fontSize: 13, color: colors.textMuted),
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
