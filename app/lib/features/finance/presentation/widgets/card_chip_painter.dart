import 'package:flutter/material.dart';

class CardChipPainter extends CustomPainter {
  final Color lineColor;

  const CardChipPainter({required this.lineColor});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = lineColor
      ..strokeWidth = 1
      ..style = PaintingStyle.stroke;
    final w = size.width;
    final h = size.height;

    canvas.drawLine(Offset(0, h / 3), Offset(w * 0.34, h / 3), paint);
    canvas.drawLine(Offset(0, h * 2 / 3), Offset(w * 0.34, h * 2 / 3), paint);
    canvas.drawLine(Offset(w * 0.66, h / 3), Offset(w, h / 3), paint);
    canvas.drawLine(Offset(w * 0.66, h * 2 / 3), Offset(w, h * 2 / 3), paint);
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTRB(w * 0.34, h * 0.2, w * 0.66, h * 0.8),
        const Radius.circular(3),
      ),
      paint,
    );
    canvas.drawLine(Offset(w / 2, 0), Offset(w / 2, h * 0.2), paint);
    canvas.drawLine(Offset(w / 2, h * 0.8), Offset(w / 2, h), paint);
  }

  @override
  bool shouldRepaint(CardChipPainter oldDelegate) => oldDelegate.lineColor != lineColor;
}
