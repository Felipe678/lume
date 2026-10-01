import 'package:flutter/material.dart';

import '../../../../core/theme/app_palette.dart';
import '../../../../core/utils/duration_formatter.dart';
import '../../domain/entities/focus_state.dart';
import '../../domain/entities/today_agenda.dart';
import '../styles/dashboard_labels.dart';

class NowCard extends StatelessWidget {
  static const double width = 330;
  static const double height = 200;

  static const TextStyle _eyebrow = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w700,
    letterSpacing: 1.4,
    color: AppPalette.cardForeground,
  );
  static const TextStyle _title = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.4,
    color: AppPalette.cardForeground,
  );
  static final TextStyle _subtitle = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w500,
    color: AppPalette.cardForeground.withValues(alpha: 0.72),
  );
  static const TextStyle _meta = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w600,
    color: AppPalette.cardForeground,
  );

  final TodayAgenda agenda;
  final DateTime now;

  const NowCard({super.key, required this.agenda, required this.now});

  @override
  Widget build(BuildContext context) {
    final content = switch (agenda.stateAt(now)) {
      FocusState.inActivity => _inActivity(),
      FocusState.freeTime => _freeTime(),
      FocusState.dayDone => _message(
        'HOJE',
        'Dia concluído',
        'Nenhuma atividade restante. Descanse, amanhã tem mais.',
      ),
      FocusState.noRoutine => _message(
        'HOJE',
        'Sem rotina hoje',
        'Monte sua grade em Tarefas e Rotina para acompanhar o dia aqui.',
      ),
    };

    // Altura fixa (não proporcional) para caber em telas estreitas; cresce com a fonte do sistema.
    final textScale = MediaQuery.textScalerOf(context).scale(1).clamp(1.0, 2.0);
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: width),
      child: SizedBox(
        height: height * textScale,
        child: Semantics(
          container: true,
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: AppPalette.cardGradient,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppPalette.cardBorder),
              boxShadow: [
                BoxShadow(
                  color: AppPalette.cardGlow.withValues(alpha: 0.35),
                  blurRadius: 48,
                  offset: const Offset(0, 14),
                ),
              ],
            ),
            child: Padding(padding: const EdgeInsets.all(22), child: content),
          ),
        ),
      ),
    );
  }

  Widget _inActivity() {
    final current = agenda.currentAt(now)!;
    final next = agenda.nextAt(now);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('AGORA', style: _eyebrow),
        const SizedBox(height: 8),
        Text(current.title, maxLines: 1, overflow: TextOverflow.ellipsis, style: _title),
        const SizedBox(height: 2),
        Text(
          DashboardLabels.goalOf(current),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: _subtitle,
        ),
        const Spacer(),
        Row(
          children: [
            Text(DashboardLabels.timeRange(current), style: _meta),
            const Spacer(),
            Text('faltam ${DurationFormatter.short(current.remainingAt(now))}', style: _meta),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(3),
          child: LinearProgressIndicator(
            value: current.progressAt(now),
            minHeight: 6,
            color: AppPalette.cardForeground,
            backgroundColor: AppPalette.cardForeground.withValues(alpha: 0.15),
            semanticsLabel: 'Progresso da atividade atual',
          ),
        ),
        const SizedBox(height: 10),
        Text(
          next == null
              ? 'Última atividade do dia'
              : 'Depois: ${next.title} · ${DashboardLabels.time(next.start)}',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: _subtitle,
        ),
      ],
    );
  }

  Widget _freeTime() {
    final next = agenda.nextAt(now)!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('AGORA', style: _eyebrow),
        const SizedBox(height: 8),
        const Text('Tempo livre', style: _title),
        const SizedBox(height: 2),
        Text('Aproveite o intervalo', style: _subtitle),
        const Spacer(),
        Text(
          'Próxima: ${next.title} às ${DashboardLabels.time(next.start)}',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: _meta,
        ),
        const SizedBox(height: 2),
        Text('em ${DurationFormatter.short(next.start.difference(now))}', style: _subtitle),
      ],
    );
  }

  Widget _message(String eyebrow, String title, String body) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(eyebrow, style: _eyebrow),
        const SizedBox(height: 8),
        Text(title, style: _title),
        const Spacer(),
        Text(body, maxLines: 3, overflow: TextOverflow.ellipsis, style: _subtitle),
      ],
    );
  }
}
