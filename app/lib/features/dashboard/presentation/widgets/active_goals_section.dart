import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/section_title.dart';
import '../../domain/entities/active_goal.dart';
import 'active_goal_chip.dart';

class ActiveGoalsSection extends StatelessWidget {
  final List<ActiveGoal> goals;

  const ActiveGoalsSection({super.key, required this.goals});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionTitle('Objetivos ativos'),
        const SizedBox(height: 18),
        if (goals.isEmpty)
          Text(
            'Nenhum objetivo ativo',
            style: TextStyle(fontSize: 13, color: AppColors.of(context).textSecondary),
          )
        else
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [for (final goal in goals) ActiveGoalChip(goal: goal)],
          ),
      ],
    );
  }
}
