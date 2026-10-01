import 'package:flutter/material.dart';

import '../../../../core/constants/breakpoints.dart';
import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/dashboard_snapshot.dart';
import 'active_goals_section.dart';
import 'day_header.dart';
import 'day_rings.dart';
import 'now_card.dart';
import 'rhythm_card.dart';
import 'upcoming_section.dart';

class DashboardCompactLayout extends StatelessWidget {
  static const double _pad = Breakpoints.pagePaddingCompact;

  final DashboardSnapshot snapshot;
  final DateTime now;

  const DashboardCompactLayout({super.key, required this.snapshot, required this.now});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        ColoredBox(
          color: AppColors.of(context).heroBand,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(_pad, 24, _pad, 32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                DayHeader(userName: snapshot.userName, now: now, compact: true),
                const SizedBox(height: 20),
                NowCard(agenda: snapshot.agenda, now: now),
                const SizedBox(height: 28),
                DayRings(
                  day: snapshot.dayProgress,
                  week: snapshot.weekConsistency,
                  goals: snapshot.goalsProgress,
                  compact: true,
                ),
              ],
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(_pad, 32, _pad, 40),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              UpcomingSection(activities: snapshot.agenda.upcomingAt(now)),
              const SizedBox(height: 40),
              ActiveGoalsSection(goals: snapshot.activeGoals),
              const SizedBox(height: 40),
              RhythmCard(
                effort: snapshot.effort,
                now: now,
                modules: snapshot.modules,
                dayProgress: snapshot.dayProgress,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
