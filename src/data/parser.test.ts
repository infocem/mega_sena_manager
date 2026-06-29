import { describe, expect, it } from 'vitest'
import { isValidConcurso, parseCaixaRaw, parseSeedEntries, parseSeedEntry } from './parser'
import type { CaixaConcursoRaw, SeedEntry } from '../types'

describe('parser', () => {
  it('parseSeedEntry ordena dezenas e normaliza tipos', () => {
    const e: SeedEntry = { n: 1, d: '11/03/1996', z: [41, 5, 4, 52, 30, 33] }
    const c = parseSeedEntry(e)
    expect(c).not.toBeNull()
    expect(c!.numero).toBe(1)
    expect(c!.data).toBe('11/03/1996')
    expect(c!.dezenas).toEqual([4, 5, 30, 33, 41, 52])
  })

  it('parseCaixaRaw converte strings de dezenas em números ordenados', () => {
    const raw: CaixaConcursoRaw = {
      numero: 3024,
      dataApuracao: '27/06/2026',
      listaDezenas: ['13', '39', '42', '44', '47', '49'],
      numeroConcursoProximo: 3025,
    }
    const c = parseCaixaRaw(raw)
    expect(c).not.toBeNull()
    expect(c!.numero).toBe(3024)
    expect(c!.dezenas).toEqual([13, 39, 42, 44, 47, 49])
  })

  it('rejeita concursos inválidos (menos de 6 dezenas, fora de 1-60, repetidas)', () => {
    expect(parseSeedEntry({ n: 2, d: 'x', z: [1, 2, 3, 4, 5] })).toBeNull()
    expect(parseSeedEntry({ n: 3, d: 'x', z: [1, 2, 3, 4, 5, 61] })).toBeNull()
    expect(parseSeedEntry({ n: 4, d: 'x', z: [1, 1, 2, 3, 4, 5] })).toBeNull()
    expect(isValidConcurso({ numero: 0, data: 'x', dezenas: [1, 2, 3, 4, 5, 6] })).toBe(false)
  })

  it('parseSeedEntries descarta inválidos e ordena por número', () => {
    const entries: SeedEntry[] = [
      { n: 3, d: 'c', z: [1, 2, 3, 4, 5, 6] },
      { n: 1, d: 'a', z: [10, 20, 30, 40, 50, 60] },
      { n: 2, d: 'b', z: [1, 2, 3] }, // inválido
    ]
    const parsed = parseSeedEntries(entries)
    expect(parsed.map((c) => c.numero)).toEqual([1, 3])
  })
})
