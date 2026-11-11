import 'package:flutter/widgets.dart';

/// Informa à árvore se o movimento deve ser reduzido (pedido do sistema).
class AppMotionScope extends InheritedWidget {
  final bool reduced;

  const AppMotionScope({
    super.key,
    required this.reduced,
    required super.child,
  });

  /// Sem escopo acima, lê o pedido do sistema para nunca ignorá-lo.
  static AppMotionScope of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AppMotionScope>();
    return scope ??
        AppMotionScope(
          reduced: MediaQuery.disableAnimationsOf(context),
          child: const SizedBox.shrink(),
        );
  }

  @override
  bool updateShouldNotify(AppMotionScope oldWidget) =>
      reduced != oldWidget.reduced;
}
