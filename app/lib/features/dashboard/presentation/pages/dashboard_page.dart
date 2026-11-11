import 'package:flutter/material.dart';

import 'package:lume/app/shell/app_page_scaffold.dart';
import '../../../../core/widgets/now_builder.dart';
import '../../domain/entities/dashboard_snapshot.dart';
import '../widgets/dashboard_compact_layout.dart';
import '../widgets/dashboard_wide_layout.dart';

class DashboardPage extends StatelessWidget {
  final DashboardSnapshot snapshot;
  final DateTime Function() clock;

  const DashboardPage({super.key, required this.snapshot, this.clock = DateTime.now});

  @override
  Widget build(BuildContext context) {
    return AppPageScaffold(
      bodyBuilder: (context, wide) => NowBuilder(
        clock: clock,
        builder: (context, now) => wide
            ? DashboardWideLayout(snapshot: snapshot, now: now)
            : DashboardCompactLayout(snapshot: snapshot, now: now),
      ),
    );
  }
}
