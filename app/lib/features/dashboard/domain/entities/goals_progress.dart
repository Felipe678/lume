class GoalsProgress {
  final int completedSteps;
  final int totalSteps;

  const GoalsProgress({required this.completedSteps, required this.totalSteps})
    : assert(totalSteps >= 0, 'totalSteps não pode ser negativo'),
      assert(
        completedSteps >= 0 && completedSteps <= totalSteps,
        'completedSteps deve estar entre 0 e totalSteps',
      );

  double get ratio => totalSteps == 0 ? 0 : completedSteps / totalSteps;
}
