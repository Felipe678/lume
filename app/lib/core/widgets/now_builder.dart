import 'dart:async';

import 'package:flutter/widgets.dart';

class NowBuilder extends StatefulWidget {
  final Widget Function(BuildContext context, DateTime now) builder;
  final DateTime Function() clock;
  final Duration interval;

  const NowBuilder({
    super.key,
    required this.builder,
    this.clock = DateTime.now,
    this.interval = const Duration(seconds: 30),
  });

  @override
  State<NowBuilder> createState() => _NowBuilderState();
}

class _NowBuilderState extends State<NowBuilder> {
  late DateTime _now = widget.clock();
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(widget.interval, (_) => setState(() => _now = widget.clock()));
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => widget.builder(context, _now);
}
