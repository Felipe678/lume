import 'package:flutter/animation.dart';

/// Tokens de movimento do Design System v2 "brasa" (docs/design-system/motion.md).
abstract final class AppMotion {
  // Durações: nada acima de `page`; sair é mais curto que entrar.
  static const Duration instant = Duration(milliseconds: 80);
  static const Duration fast = Duration(milliseconds: 140);
  static const Duration exit = Duration(milliseconds: 160);
  static const Duration base = Duration(milliseconds: 220);
  static const Duration slow = Duration(milliseconds: 360);
  static const Duration page = Duration(milliseconds: 480);
  static const Duration pulse = Duration(milliseconds: 600);
  static const Duration breathe = Duration(milliseconds: 6000);

  // Curvas: entrar com easeOut, sair com easeIn; anima só opacity e transform.
  static const Curve easeOut = Curves.easeOutCubic;
  static const Curve easeIn = Curves.easeInCubic;
  static const Curve settle = Cubic(0.16, 1, 0.3, 1);
  static const Curve outQuint = Curves.easeOutQuint;
  static const Curve outExpo = Curves.easeOutExpo;
  static const Curve inOut = Curves.easeInOutCubic;
  static const Curve spring = Cubic(0.34, 1.56, 0.64, 1);
}
