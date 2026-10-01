import 'package:flutter/material.dart';

import '../../../../core/theme/app_palette.dart';

class MastercardMark extends StatelessWidget {
  static const double _circle = 12;
  static const double _overlap = 5;

  const MastercardMark({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: _circle * 2 - _overlap,
      height: _circle,
      child: Stack(
        children: [
          _dot(AppPalette.mastercardRed, 0),
          _dot(AppPalette.mastercardYellow.withValues(alpha: 0.9), _circle - _overlap),
        ],
      ),
    );
  }

  Widget _dot(Color color, double left) {
    return Positioned(
      left: left,
      child: Container(
        width: _circle,
        height: _circle,
        decoration: BoxDecoration(color: color, shape: BoxShape.circle),
      ),
    );
  }
}
