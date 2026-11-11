import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/section_title.dart';
import '../../domain/entities/scheduled_activity.dart';
import 'upcoming_activity_row.dart';

class UpcomingSection extends StatelessWidget {
  final List<ScheduledActivity> activities;

  const UpcomingSection({super.key, required this.activities});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionTitle('Próximas atividades'),
        const SizedBox(height: 20),
        if (activities.isEmpty)
          Text(
            'Nada mais agendado para hoje',
            style: TextStyle(fontSize: 13, color: AppColors.of(context).textSecondary),
          )
        else
          for (var i = 0; i < activities.length; i++)
            Padding(
              padding: EdgeInsets.only(top: i == 0 ? 0 : 18),
              child: UpcomingActivityRow(activity: activities[i]),
            ),
      ],
    );
  }
}
