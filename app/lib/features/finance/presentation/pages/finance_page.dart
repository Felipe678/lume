import 'package:flutter/material.dart';

import 'package:lume/app/shell/app_page_scaffold.dart';
import '../../domain/entities/finance_snapshot.dart';
import '../widgets/finance_compact_layout.dart';
import '../widgets/finance_wide_layout.dart';

class FinancePage extends StatelessWidget {
  final FinanceSnapshot snapshot;

  const FinancePage({super.key, required this.snapshot});

  @override
  Widget build(BuildContext context) {
    return AppPageScaffold(
      bodyBuilder: (context, wide) =>
          wide ? FinanceWideLayout(snapshot: snapshot) : FinanceCompactLayout(snapshot: snapshot),
    );
  }
}
