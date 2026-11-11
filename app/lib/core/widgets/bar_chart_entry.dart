import 'package:flutter/material.dart';

class BarChartEntry {
  final String label;
  final double value;
  final Color color;
  final Color labelColor;
  final bool glow;
  final String tooltip;

  const BarChartEntry({
    required this.label,
    required this.value,
    required this.color,
    required this.labelColor,
    required this.glow,
    required this.tooltip,
  }) : assert(value >= 0, 'value não pode ser negativo');
}
