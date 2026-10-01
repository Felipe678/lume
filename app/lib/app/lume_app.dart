import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/theme/app_theme.dart';
import 'navigation/app_router.dart';
import 'navigation/app_routes.dart';

class LumeApp extends StatefulWidget {
  final ThemeMode themeMode;
  final String initialLocation;

  // Escuro por padrão até o design do tema claro ser implementado.
  const LumeApp({
    super.key,
    this.themeMode = ThemeMode.dark,
    this.initialLocation = AppRoutes.overview,
  });

  @override
  State<LumeApp> createState() => _LumeAppState();
}

class _LumeAppState extends State<LumeApp> {
  late final GoRouter _router = AppRouter.create(initialLocation: widget.initialLocation);

  @override
  void dispose() {
    _router.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Lume',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: widget.themeMode,
      routerConfig: _router,
    );
  }
}
