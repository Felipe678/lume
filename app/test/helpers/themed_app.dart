import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lume/core/theme/app_theme.dart';

Widget themedApp(Widget home, {ThemeMode mode = ThemeMode.dark}) {
  return MaterialApp(
    theme: AppTheme.light(),
    darkTheme: AppTheme.dark(),
    themeMode: mode,
    home: home,
  );
}

void setScreen(WidgetTester tester, Size size) {
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
}

const screenSizes = [
  Size(1440, 900),
  Size(1080, 720),
  Size(1920, 1080),
  Size(768, 1024),
  Size(390, 844),
  Size(320, 640),
];
