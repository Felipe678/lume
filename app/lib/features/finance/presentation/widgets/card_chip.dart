import 'package:flutter/material.dart';

import '../../../../core/theme/app_palette.dart';
import 'card_chip_painter.dart';

class CardChip extends StatelessWidget {
  const CardChip({super.key});

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: AppPalette.chipGradient,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: AppPalette.cardChipBorder, width: 0.8),
      ),
      child: const CustomPaint(painter: CardChipPainter(lineColor: AppPalette.cardChipLine)),
    );
  }
}
