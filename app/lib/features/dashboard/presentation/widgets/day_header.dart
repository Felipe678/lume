import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../styles/dashboard_labels.dart';

class DayHeader extends StatelessWidget {
  final String userName;
  final DateTime now;
  final bool compact;

  const DayHeader({super.key, required this.userName, required this.now, required this.compact});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final eyebrow = TextStyle(fontSize: 15, fontWeight: FontWeight.w500, color: colors.textPrimary);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (compact) ...[
          Text(DashboardLabels.salutation(userName, now), style: eyebrow),
          const SizedBox(height: 2),
          Text(
            DashboardLabels.dayLine(now),
            style: TextStyle(fontSize: 13, color: colors.textSecondary),
          ),
        ] else
          Text(DashboardLabels.headerLine(userName, now), style: eyebrow),
        const SizedBox(height: 6),
        Text(
          'Seu dia',
          style: TextStyle(
            fontSize: compact ? 28 : 36,
            fontWeight: FontWeight.w700,
            letterSpacing: -0.6,
            height: 1.15,
            color: colors.textPrimary,
          ),
        ),
      ],
    );
  }
}
