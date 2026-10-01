import 'package:flutter/material.dart';
import 'package:lume/app/shell/app_page_scaffold.dart';

class TimePage extends StatelessWidget {
  const TimePage({super.key});

  @override
  Widget build(BuildContext context) {
    return AppPageScaffold(bodyBuilder: (context, wide) => const SizedBox.shrink());
  }
}
