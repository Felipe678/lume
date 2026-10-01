import 'package:go_router/go_router.dart';
import 'package:lume/features/dashboard/data/datasources/dashboard_mock_datasource.dart';
import 'package:lume/features/dashboard/presentation/pages/dashboard_page.dart';
import 'package:lume/features/time/presentation/pages/time_page.dart';

import 'app_routes.dart';

abstract final class AppRouter {
  static GoRouter create({String initialLocation = AppRoutes.overview}) {
    return GoRouter(
      initialLocation: initialLocation,
      // Link para rota inexistente volta para a visão geral em vez de mostrar erro.
      onException: (context, state, router) => router.go(AppRoutes.overview),
      routes: [
        GoRoute(
          path: AppRoutes.overview,
          builder: (context, state) =>
              DashboardPage(snapshot: const DashboardMockDataSource().load(DateTime.now())),
        ),
        GoRoute(path: AppRoutes.time, builder: (context, state) => const TimePage()),
      ],
    );
  }
}
