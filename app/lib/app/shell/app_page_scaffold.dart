import 'package:flutter/material.dart';

import 'package:lume/core/constants/breakpoints.dart';
import 'package:lume/core/theme/app_motion_scope.dart';
import 'package:lume/app/shell/app_footer.dart';
import 'package:lume/app/shell/app_top_bar.dart';

class AppPageScaffold extends StatelessWidget {
  final Widget Function(BuildContext context, bool wide) bodyBuilder;

  const AppPageScaffold({super.key, required this.bodyBuilder});

  @override
  Widget build(BuildContext context) {
    final reduced = MediaQuery.disableAnimationsOf(context);
    return AppMotionScope(
      reduced: reduced,
      child: Scaffold(
        body: SafeArea(
          child: LayoutBuilder(
            builder: (context, constraints) {
              final wide = constraints.maxWidth >= Breakpoints.desktop;
              return Column(
                children: [
                  AppTopBar(compact: !wide),
                  Expanded(
                    child: LayoutBuilder(
                      builder: (context, viewport) => SingleChildScrollView(
                        child: ConstrainedBox(
                          constraints: BoxConstraints(minHeight: viewport.maxHeight),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              bodyBuilder(context, wide),
                              AppFooter(
                                horizontalPadding: wide
                                    ? Breakpoints.pagePaddingWide
                                    : Breakpoints.pagePaddingCompact,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}
