import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/duration_formatter.dart';
import '../../domain/entities/scheduled_activity.dart';
import '../styles/dashboard_labels.dart';
import '../styles/dashboard_visuals.dart';

class UpcomingActivityRow extends StatelessWidget {
  final ScheduledActivity activity;

  const UpcomingActivityRow({super.key, required this.activity});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final start = DashboardLabels.time(activity.start);
    final goal = DashboardLabels.goalOf(activity);
    final duration = DurationFormatter.short(activity.duration);

    return Semantics(
      label: '$start, ${activity.title}, $goal, duração $duration',
      excludeSemantics: true,
      child: Row(
        children: [
          SizedBox(
            width: 56,
            child: Text(
              start,
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: colors.textPrimary,
              ),
            ),
          ),
          Container(
            width: 3,
            height: 36,
            decoration: BoxDecoration(
              color: DashboardVisuals.activity(activity),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  activity.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: colors.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  goal,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(fontSize: 11, color: colors.textMuted),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          SizedBox(
            width: 84,
            child: Align(
              alignment: Alignment.centerRight,
              child: FittedBox(
                fit: BoxFit.scaleDown,
                child: Text(
                  duration,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: colors.textPrimary,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
