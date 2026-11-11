import 'package:flutter/material.dart';

import '../constants/breakpoints.dart';

class ContentWidth extends StatelessWidget {
  final Widget child;

  const ContentWidth({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(
          maxWidth: Breakpoints.contentMaxWidth + Breakpoints.pagePaddingWide * 2,
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: Breakpoints.pagePaddingWide),
          child: child,
        ),
      ),
    );
  }
}
