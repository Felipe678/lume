import 'package:flutter/cupertino.dart' show CupertinoPageTransitionsBuilder;
import 'package:flutter/material.dart';

import 'app_colors.dart';
import 'app_page_transitions_builder.dart';

class AppTheme {
  const AppTheme._();

  static const String fontFamily = 'Inter';

  static ThemeData light() => _build(Brightness.light, AppColors.light);

  static ThemeData dark() => _build(Brightness.dark, AppColors.dark);

  static ThemeData _build(Brightness brightness, AppColors colors) {
    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      fontFamily: fontFamily,
      scaffoldBackgroundColor: colors.background,
      extensions: [colors],
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: AppPageTransitionsBuilder(
            delegate: PredictiveBackPageTransitionsBuilder(),
          ),
          TargetPlatform.iOS: AppPageTransitionsBuilder(
            delegate: CupertinoPageTransitionsBuilder(),
          ),
          TargetPlatform.macOS: AppPageTransitionsBuilder(
            delegate: CupertinoPageTransitionsBuilder(),
          ),
          TargetPlatform.windows: AppPageTransitionsBuilder(
            delegate: ZoomPageTransitionsBuilder(),
          ),
          TargetPlatform.linux: AppPageTransitionsBuilder(
            delegate: ZoomPageTransitionsBuilder(),
          ),
          TargetPlatform.fuchsia: AppPageTransitionsBuilder(
            delegate: ZoomPageTransitionsBuilder(),
          ),
        },
      ),
    );
  }
}
