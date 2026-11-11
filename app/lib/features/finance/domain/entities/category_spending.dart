import 'spending_category.dart';

class CategorySpending {
  final SpendingCategory category;
  final double amount;

  const CategorySpending({required this.category, required this.amount})
    : assert(amount >= 0, 'amount não pode ser negativo');
}
