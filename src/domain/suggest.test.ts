import { describe, expect, it } from 'vitest'
import { PRIORITY_PRESETS, suggestBlocks } from './suggest'
import { validateBlockInput } from './validate'

describe('suggestBlocks', () => {
  it('prioridade alta = 5 dias de 1h; média = 3×45min; baixa = 2×30min', () => {
    const alta = suggestBlocks('alta', 'Inglês')[0]
    expect(alta.weekdays).toEqual([1, 2, 3, 4, 5])
    expect(alta.start).toBe('19:00')
    expect(alta.end).toBe('20:00')

    const media = suggestBlocks('media', 'Inglês')[0]
    expect(media.weekdays).toEqual([1, 3, 5])
    expect(media.end).toBe('19:45')

    const baixa = suggestBlocks('baixa', 'Inglês')[0]
    expect(baixa.weekdays).toEqual([2, 4])
    expect(baixa.end).toBe('19:30')
  })

  it('todos os drafts sugeridos passam na validação de bloco', () => {
    for (const p of ['alta', 'media', 'baixa'] as const) {
      for (const draft of suggestBlocks(p, 'Objetivo X')) {
        expect(validateBlockInput(draft)).toEqual([])
      }
    }
  })

  it('respeita horário de início custom e não estoura a meia-noite', () => {
    const tarde = suggestBlocks('alta', 'X', { start: '23:30' })[0]
    expect(tarde.end).toBe('23:59')
    expect(validateBlockInput(tarde)).toEqual([])
  })

  it('desvia do trabalho quando a rotina é informada (edge 28)', () => {
    const trabalhoTarde = {
      mode: 'weekly' as const,
      weekdays: [1, 2, 3, 4, 5] as (1 | 2 | 3 | 4 | 5)[],
      start: '12:00',
      end: '21:00',
    }
    const draft = suggestBlocks('alta', 'Inglês', { workSchedule: trabalhoTarde, refDate: '2026-07-29' })[0]
    expect(draft.start).toBe('22:00') // fim do expediente + 1h
    expect(validateBlockInput(draft)).toEqual([])
  })

  it('presets expostos para a UI explicarem o porquê', () => {
    expect(PRIORITY_PRESETS.alta.label).toContain('5×')
  })
})
