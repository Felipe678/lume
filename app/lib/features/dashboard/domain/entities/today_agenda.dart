import 'focus_state.dart';
import 'scheduled_activity.dart';

class TodayAgenda {
  final List<ScheduledActivity> activities;

  TodayAgenda(List<ScheduledActivity> activities)
    : activities = List.unmodifiable([...activities]..sort((a, b) => a.start.compareTo(b.start)));

  ScheduledActivity? currentAt(DateTime now) {
    for (final activity in activities) {
      if (activity.isActiveAt(now)) return activity;
    }
    return null;
  }

  ScheduledActivity? nextAt(DateTime now) {
    for (final activity in activities) {
      if (activity.start.isAfter(now)) return activity;
    }
    return null;
  }

  List<ScheduledActivity> upcomingAt(DateTime now, {int limit = 4}) {
    assert(limit > 0, 'limit deve ser positivo');
    return activities.where((a) => a.start.isAfter(now)).take(limit).toList(growable: false);
  }

  FocusState stateAt(DateTime now) {
    if (activities.isEmpty) return FocusState.noRoutine;
    if (currentAt(now) != null) return FocusState.inActivity;
    if (nextAt(now) != null) return FocusState.freeTime;
    return FocusState.dayDone;
  }
}
