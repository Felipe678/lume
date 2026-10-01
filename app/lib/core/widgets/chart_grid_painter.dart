import 'package:flutter/material.dart';

class ChartGridPainter extends CustomPainter {
  final Color lineColor;
  final int divisions;

  const ChartGridPainter({required this.lineColor, required this.divisions});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = lineColor
      ..strokeWidth = 1;
    for (var i = 0; i <= divisions; i++) {
      final y = (size.height / divisions) * i;
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(ChartGridPainter oldDelegate) =>
      oldDelegate.lineColor != lineColor || oldDelegate.divisions != divisions;
}
