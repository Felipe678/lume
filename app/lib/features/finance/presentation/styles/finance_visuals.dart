import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_palette.dart';
import '../../domain/entities/card_tone.dart';
import '../../domain/entities/metric_kind.dart';
import '../../domain/entities/recurring_tone.dart';
import '../../domain/entities/spending_category.dart';
import '../../domain/entities/spending_tone.dart';
import '../../domain/entities/transaction_category.dart';

abstract final class FinanceVisuals {
  static Color metric(MetricKind kind) => switch (kind) {
    MetricKind.income => AppPalette.violet,
    MetricKind.expense => AppPalette.cyan,
    MetricKind.cashback => AppPalette.orange,
  };

  static Color cardTone(CardTone tone) => switch (tone) {
    CardTone.red => AppPalette.badgeRed,
    CardTone.blue => AppPalette.badgeBlue,
    CardTone.neutral => AppPalette.badgeNeutral,
  };

  static Color recurring(RecurringTone tone) => switch (tone) {
    RecurringTone.blue => AppPalette.blue,
    RecurringTone.yellow => AppPalette.yellow,
    RecurringTone.green => AppPalette.green,
    RecurringTone.orange => AppPalette.orange,
    RecurringTone.mint => AppPalette.mint,
    RecurringTone.purple => AppPalette.purple,
  };

  static Color spendingBar(SpendingTone tone, AppColors colors) => switch (tone) {
    SpendingTone.muted => colors.barMuted,
    SpendingTone.regular => AppPalette.violet,
    SpendingTone.highlight => AppPalette.cyan,
  };

  static IconData transactionIcon(TransactionCategory category) => switch (category) {
    TransactionCategory.games => Icons.sports_esports_rounded,
    TransactionCategory.cafe => Icons.coffee_rounded,
    TransactionCategory.health => Icons.medical_services_rounded,
    TransactionCategory.food => Icons.restaurant_rounded,
  };

  static IconData spendingCategoryIcon(SpendingCategory category) => switch (category) {
    SpendingCategory.restaurants => Icons.restaurant_rounded,
    SpendingCategory.subscriptions => Icons.apple,
    SpendingCategory.cafe => Icons.local_cafe_rounded,
  };

  static Color spendingCategoryIconColor(SpendingCategory category) => switch (category) {
    SpendingCategory.restaurants => AppPalette.blue,
    SpendingCategory.subscriptions => AppPalette.onCard,
    SpendingCategory.cafe => AppPalette.red,
  };

  static Color spendingCategoryWell(SpendingCategory category, AppColors colors) =>
      switch (category) {
        SpendingCategory.subscriptions => Colors.white,
        SpendingCategory.restaurants || SpendingCategory.cafe => colors.background,
      };
}
