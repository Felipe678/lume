import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'modules_menu_panel.dart';

/// Menu suspenso ancorado no botão de módulos: abre com fade + escala a partir do canto do botão.
class ModulesMenuRoute extends PopupRoute<void> {
  static const double _maxWidth = 380;
  static const double _margin = 16;
  static const double _gapBelowAnchor = 8;

  final Rect anchor;
  final String? currentPath;

  ModulesMenuRoute({required this.anchor, required this.currentPath});

  @override
  Color? get barrierColor => Colors.black.withValues(alpha: 0.25);

  @override
  bool get barrierDismissible => true;

  @override
  String? get barrierLabel => 'Fechar menu de módulos';

  @override
  Duration get transitionDuration => const Duration(milliseconds: 220);

  @override
  Duration get reverseTransitionDuration => const Duration(milliseconds: 160);

  @override
  Widget buildPage(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
  ) {
    final size = MediaQuery.sizeOf(context);
    final width = math.min(_maxWidth, size.width - _margin * 2);
    final maxRight = math.max(_margin, size.width - width - _margin);
    final right = (size.width - anchor.right).clamp(_margin, maxRight);
    final top = anchor.bottom + _gapBelowAnchor;
    final maxHeight = math.max(0.0, size.height - top - _margin);

    return Stack(
      children: [
        Positioned(
          top: top,
          right: right,
          width: width,
          child: ConstrainedBox(
            constraints: BoxConstraints(maxHeight: maxHeight),
            child: ModulesMenuPanel(currentPath: currentPath),
          ),
        ),
      ],
    );
  }

  @override
  Widget buildTransitions(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    final curved = CurvedAnimation(
      parent: animation,
      curve: Curves.easeOutCubic,
      reverseCurve: Curves.easeInCubic,
    );
    return FadeTransition(
      opacity: curved,
      child: ScaleTransition(
        alignment: Alignment.topRight,
        scale: Tween<double>(begin: 0.92, end: 1).animate(curved),
        child: SlideTransition(
          position: Tween<Offset>(begin: const Offset(0, -0.015), end: Offset.zero).animate(curved),
          child: child,
        ),
      ),
    );
  }
}
