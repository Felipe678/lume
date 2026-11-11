import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'app_motion.dart';

/// Transição de página: com "reduzir movimento", só fade completo em até `instant`;
/// sem a flag, repassa tudo (inclusive durações) ao delegate da plataforma.
class AppPageTransitionsBuilder extends PageTransitionsBuilder {
  final PageTransitionsBuilder delegate;

  const AppPageTransitionsBuilder({required this.delegate});

  @override
  Duration get transitionDuration => delegate.transitionDuration;

  @override
  Duration get reverseTransitionDuration => delegate.reverseTransitionDuration;

  @override
  Widget buildTransitions<T>(
    PageRoute<T> route,
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    if (!MediaQuery.disableAnimationsOf(context)) {
      return delegate.buildTransitions<T>(
        route,
        context,
        animation,
        secondaryAnimation,
        child,
      );
    }
    final forward = _fraction(delegate.transitionDuration);
    final reverse = _fraction(delegate.reverseTransitionDuration);
    final opacity = CurvedAnimation(
      parent: animation,
      curve: Interval(0, forward, curve: AppMotion.easeOut),
      reverseCurve: Interval(1 - reverse, 1, curve: AppMotion.easeIn),
    );
    return FadeTransition(opacity: opacity, child: child);
  }

  /// Fração da duração da rota ocupada por `instant` (em microssegundos).
  static double _fraction(Duration total) {
    if (total.inMicroseconds <= 0) return 1;
    return math.min(1, AppMotion.instant.inMicroseconds / total.inMicroseconds);
  }
}
