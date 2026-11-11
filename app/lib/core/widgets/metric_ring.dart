import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import 'ring_painter.dart';

class MetricRing extends StatelessWidget {
  final double progress;
  final String centerLabel;
  final Color accent;
  final double size;

  const MetricRing({
    super.key,
    required this.progress,
    required this.centerLabel,
    required this.accent,
    required this.size,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        // Preenchido para o brilho colorido ficar só do lado de fora do anel.
        color: colors.heroBand,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: accent.withValues(alpha: 0.28),
            blurRadius: 26,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: CustomPaint(
        painter: RingPainter(
          progress: progress,
          color: accent,
          trackColor: colors.ringTrack,
          strokeWidth: 7,
        ),
        child: Center(
          child: Text(
            centerLabel,
            style: TextStyle(
              fontSize: size >= 72 ? 18 : 16,
              fontWeight: FontWeight.w600,
              color: colors.textPrimary,
            ),
          ),
        ),
      ),
    );
  }
}
