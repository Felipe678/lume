import 'package:flutter_test/flutter_test.dart';
import 'package:lume/features/dashboard/domain/entities/focus_state.dart';
import 'package:lume/features/dashboard/domain/entities/goal_color.dart';
import 'package:lume/features/dashboard/domain/entities/scheduled_activity.dart';
import 'package:lume/features/dashboard/domain/entities/today_agenda.dart';

DateTime _t(int hour, [int minute = 0]) => DateTime(2026, 9, 28, hour, minute);

ScheduledActivity _activity(String title, DateTime start, DateTime end) =>
    ScheduledActivity(title: title, start: start, end: end);

void main() {
  final morning = _activity('Manhã', _t(9), _t(10));
  final noon = _activity('Almoço', _t(12), _t(13));
  final evening = _activity('Noite', _t(19), _t(20));

  group('TodayAgenda', () {
    test('ordena as atividades pelo início', () {
      final agenda = TodayAgenda([evening, morning, noon]);

      expect(agenda.activities.map((a) => a.title), ['Manhã', 'Almoço', 'Noite']);
    });

    test('em atividade: início é inclusivo', () {
      final agenda = TodayAgenda([morning, noon]);

      expect(agenda.currentAt(_t(9)), morning);
      expect(agenda.stateAt(_t(9)), FocusState.inActivity);
    });

    test('fim é exclusivo: às 10:00 a atividade das 9 já terminou', () {
      final agenda = TodayAgenda([morning, noon]);

      expect(agenda.currentAt(_t(10)), isNull);
      expect(agenda.stateAt(_t(10)), FocusState.freeTime);
      expect(agenda.nextAt(_t(10)), noon);
    });

    test('atividade que começa agora é atual, não próxima', () {
      final agenda = TodayAgenda([morning, noon]);

      expect(agenda.nextAt(_t(12)), isNull);
      expect(agenda.currentAt(_t(12)), noon);
    });

    test('dia concluído depois da última atividade', () {
      final agenda = TodayAgenda([morning]);

      expect(agenda.stateAt(_t(22)), FocusState.dayDone);
      expect(agenda.upcomingAt(_t(22)), isEmpty);
    });

    test('sem rotina quando não há atividades', () {
      expect(TodayAgenda(const []).stateAt(_t(9)), FocusState.noRoutine);
    });

    test('próximas atividades respeitam o limite e ignoram a atual', () {
      final agenda = TodayAgenda([morning, noon, evening]);

      expect(agenda.upcomingAt(_t(9, 30), limit: 1), [noon]);
      expect(agenda.upcomingAt(_t(9, 30)), [noon, evening]);
    });

    test('lista de atividades é imutável', () {
      final agenda = TodayAgenda([morning]);

      expect(() => agenda.activities.add(noon), throwsUnsupportedError);
    });
  });

  group('ScheduledActivity', () {
    test('tempo restante e progresso no meio da atividade', () {
      final a = _activity('Estudo', _t(14), _t(15, 30));

      expect(a.remainingAt(_t(14, 48)), const Duration(minutes: 42));
      expect(a.progressAt(_t(14, 45)), closeTo(0.5, 0.001));
    });

    test('restante é zero após o fim e total antes do início', () {
      final a = _activity('Estudo', _t(14), _t(15));

      expect(a.remainingAt(_t(16)), Duration.zero);
      expect(a.remainingAt(_t(13)), const Duration(hours: 1));
      expect(a.progressAt(_t(13)), 0);
      expect(a.progressAt(_t(16)), 1);
    });

    test('sem objetivo é obrigatória', () {
      expect(_activity('Almoço', _t(12), _t(13)).isObligatory, isTrue);
      expect(
        ScheduledActivity(
          title: 'Inglês',
          start: _t(8),
          end: _t(9),
          goalTitle: 'Fluência',
          goalColor: GoalColor.sky,
        ).isObligatory,
        isFalse,
      );
    });

    test('rejeita fim antes do início', () {
      expect(() => _activity('X', _t(10), _t(9)), throwsA(isA<AssertionError>()));
    });

    test('rejeita duração zero', () {
      expect(() => _activity('X', _t(10), _t(10)), throwsA(isA<AssertionError>()));
    });

    test('rejeita título vazio', () {
      expect(() => _activity('  ', _t(9), _t(10)), throwsA(isA<AssertionError>()));
    });

    test('rejeita objetivo sem cor', () {
      expect(
        () => ScheduledActivity(title: 'X', start: _t(9), end: _t(10), goalTitle: 'Meta'),
        throwsA(isA<AssertionError>()),
      );
    });
  });
}
