import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import 'metric_ring.dart';

class RingStatTile extends StatelessWidget {
  static const double wideWidth = 190;

  final double progress;
  final String centerLabel;
  final String value;
  final String label;
  final Color accent;
  final bool compact;

  const RingStatTile({
    super.key,
    required this.progress,
    required this.centerLabel,
    required this.value,
    required this.label,
    required this.accent,
    required this.compact,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final ring = MetricRing(
      progress: progress,
      centerLabel: centerLabel,
      accent: accent,
      size: compact ? 64 : 72,
    );
    final valueText = FittedBox(
      fit: BoxFit.scaleDown,
      child: Text(
        value,
        style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: colors.textPrimary),
      ),
    );
    final labelText = FittedBox(
      fit: BoxFit.scaleDown,
      child: Text(label, style: TextStyle(fontSize: 13, color: colors.textSecondary)),
    );

    return Semantics(
      label: '$label: $value, $centerLabel',
      excludeSemantics: true,
      child: compact
          ? Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                ring,
                const SizedBox(height: 12),
                valueText,
                const SizedBox(height: 2),
                labelText,
              ],
            )
          : SizedBox(
              width: wideWidth,
              child: Row(
                children: [
                  ring,
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Align(alignment: Alignment.centerLeft, child: valueText),
                        const SizedBox(height: 2),
                        Align(alignment: Alignment.centerLeft, child: labelText),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
