import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/content_width.dart';
import '../../domain/entities/dashboard_snapshot.dart';
import 'active_goals_section.dart';
import 'day_header.dart';
import 'day_rings.dart';
import 'now_card.dart';
import 'rhythm_card.dart';
import 'upcoming_section.dart';

class DashboardWideLayout extends StatelessWidget {
  static const double _bandOverlap = 48;

  final DashboardSnapshot snapshot;
  final DateTime now;

  const DashboardWideLayout({super.key, required this.snapshot, required this.now});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        ColoredBox(
          color: AppColors.of(context).heroBand,
          child: ContentWidth(
            child: Padding(
              padding: const EdgeInsets.only(top: 48, bottom: _bandOverlap),
              child: _hero(),
            ),
          ),
        ),
        ContentWidth(
          child: Padding(padding: const EdgeInsets.only(bottom: 48), child: _body()),
        ),
      ],
    );
  }

  Widget _hero() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: NowCard.width,
          child: NowCard(agenda: snapshot.agenda, now: now),
        ),
        const SizedBox(width: 40),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                DayHeader(userName: snapshot.userName, now: now, compact: false),
                const SizedBox(height: 30),
                DayRings(
                  day: snapshot.dayProgress,
                  week: snapshot.weekConsistency,
                  goals: snapshot.goalsProgress,
                  compact: false,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // O card de ritmo sobe para cruzar a faixa do topo, como no design de referência.
  Widget _body() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(top: 86 - _bandOverlap),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                UpcomingSection(activities: snapshot.agenda.upcomingAt(now)),
                const SizedBox(height: 56),
                ActiveGoalsSection(goals: snapshot.activeGoals),
              ],
            ),
          ),
        ),
        const SizedBox(width: 48),
        SizedBox(
          width: RhythmCard.width,
          child: Transform.translate(
            offset: const Offset(0, -_bandOverlap),
            child: RhythmCard(
              effort: snapshot.effort,
              now: now,
              modules: snapshot.modules,
              dayProgress: snapshot.dayProgress,
            ),
          ),
        ),
      ],
    );
  }
}
