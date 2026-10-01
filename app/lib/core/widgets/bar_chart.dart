import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import 'bar_chart_entry.dart';
import 'chart_grid_painter.dart';

class BarChart extends StatelessWidget {
  static const double _chartHeight = 165;
  static const double _maxBarWidth = 18;
  static const double _headroom = 1.2;

  final List<BarChartEntry> entries;
  final String emptyMessage;

  const BarChart({super.key, required this.entries, required this.emptyMessage});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    if (entries.isEmpty) {
      return SizedBox(
        height: _chartHeight,
        child: Center(
          child: Text(emptyMessage, style: TextStyle(fontSize: 13, color: colors.textSecondary)),
        ),
      );
    }

    final maxValue = entries.map((e) => e.value).reduce(math.max);
    final scale = maxValue == 0 ? 0.0 : _chartHeight / (maxValue * _headroom);

    return LayoutBuilder(
      builder: (context, constraints) {
        final slot = constraints.maxWidth / entries.length;
        final barWidth = math.min(_maxBarWidth, slot * 0.6);
        return Column(
          children: [
            SizedBox(
              height: _chartHeight,
              child: CustomPaint(
                painter: ChartGridPainter(lineColor: colors.divider, divisions: 4),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    for (final entry in entries)
                      Expanded(
                        child: Center(
                          heightFactor: 1,
                          child: Tooltip(
                            message: entry.tooltip,
                            child: _bar(entry, entry.value * scale, barWidth),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                for (final entry in entries)
                  Expanded(
                    child: Text(
                      entry.label,
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 11, color: entry.labelColor),
                    ),
                  ),
              ],
            ),
          ],
        );
      },
    );
  }

  Widget _bar(BarChartEntry entry, double height, double width) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: entry.color,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(3)),
        boxShadow: entry.glow
            ? [
                BoxShadow(
                  color: entry.color.withValues(alpha: 0.45),
                  blurRadius: 24,
                  offset: const Offset(0, 8),
                ),
              ]
            : null,
      ),
    );
  }
}
