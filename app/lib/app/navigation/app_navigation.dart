import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';

/// Acesso ao roteador que tolera telas montadas sem ele (ex.: testes de uma página isolada).
abstract final class AppNavigation {
  static String? currentPath(BuildContext context) =>
      GoRouter.maybeOf(context)?.routeInformationProvider.value.uri.path;

  static void go(BuildContext context, String path) => GoRouter.maybeOf(context)?.go(path);
}
