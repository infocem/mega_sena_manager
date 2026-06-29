import { describe, expect, it } from 'vitest'
import {
  aplicarJanela,
  atraso,
  calcularMetricas,
  distribuicaoLinhasColunas,
  frequencia,
  parImpar,
  percentil,
  somaStats,
} from './metrics'
import type { Concurso } from '../types'

// Fixture pequena (ordem crescente) com valores calculados manualmente.
const FIX: Concurso[] = [
  { numero: 1, data: 'a', dezenas: [1, 2, 3, 4, 5, 6] }, // 3 pares, soma 21
  { numero: 2, data: 'b', dezenas: [10, 20, 30, 40, 50, 60] }, // 6 pares, soma 210
  { numero: 3, data: 'c', dezenas: [1, 2, 3, 4, 5, 7] }, // 2 pares, soma 22
  { numero: 4, data: 'd', dezenas: [5, 15, 25, 35, 45, 55] }, // 0 pares, soma 180
]

const byDezena = <T extends { dezena: number }>(arr: T[], d: number): T =>
  arr.find((x) => x.dezena === d)!

describe('metrics', () => {
  it('aplicarJanela recorta os mais recentes', () => {
    expect(aplicarJanela(FIX, 'tudo')).toHaveLength(4)
    expect(aplicarJanela(FIX, 2).map((c) => c.numero)).toEqual([3, 4])
    expect(aplicarJanela(FIX, 100).map((c) => c.numero)).toEqual([1, 2, 3, 4])
  })

  it('percentil por interpolação linear', () => {
    const arr = [21, 22, 180, 210]
    expect(percentil(arr, 0.5)).toBeCloseTo(101)
    expect(percentil(arr, 0.1)).toBeCloseTo(21.3)
    expect(percentil(arr, 0.9)).toBeCloseTo(201)
  })

  it('frequencia conta por dezena na janela', () => {
    const f = frequencia(FIX, 'tudo')
    expect(f).toHaveLength(60)
    expect(byDezena(f, 5).contagem).toBe(3)
    expect(byDezena(f, 1).contagem).toBe(2)
    expect(byDezena(f, 6).contagem).toBe(1)
    expect(byDezena(f, 8).contagem).toBe(0)
    // janela=2 (c3,c4)
    const f2 = frequencia(FIX, 2)
    expect(byDezena(f2, 5).contagem).toBe(2)
    expect(byDezena(f2, 1).contagem).toBe(1)
    expect(byDezena(f2, 6).contagem).toBe(0)
  })

  it('atraso = concursos desde a última saída', () => {
    const a = atraso(FIX, 'tudo')
    expect(byDezena(a, 5).atraso).toBe(0) // saiu no último (c4)
    expect(byDezena(a, 1).atraso).toBe(1) // saiu em c3
    expect(byDezena(a, 6).atraso).toBe(3) // saiu em c1
    expect(byDezena(a, 60).atraso).toBe(2) // saiu em c2
    expect(byDezena(a, 8).atraso).toBe(4) // nunca saiu → tamanho da janela
  })

  it('parImpar tallya pares por concurso', () => {
    const p = parImpar(FIX, 'tudo')
    const get = (pares: number) => p.find((x) => x.pares === pares)!.contagem
    expect(get(0)).toBe(1)
    expect(get(2)).toBe(1)
    expect(get(3)).toBe(1)
    expect(get(6)).toBe(1)
    expect(get(1)).toBe(0)
  })

  it('somaStats calcula min/max/media/mediana/percentis', () => {
    const s = somaStats(FIX, 'tudo')
    expect(s.min).toBe(21)
    expect(s.max).toBe(210)
    expect(s.media).toBeCloseTo(108.25)
    expect(s.mediana).toBeCloseTo(101)
    expect(s.p10).toBeCloseTo(21.3)
    expect(s.p90).toBeCloseTo(201)
  })

  it('distribuicaoLinhasColunas mapeia o volante físico 10x6', () => {
    const d = distribuicaoLinhasColunas(FIX, 'tudo')
    // 10 linhas (linha k = dezenas 6k+1..6k+6), 6 colunas
    expect(d.linhas.map((l) => l.contagem)).toEqual([12, 2, 1, 1, 2, 1, 1, 1, 1, 2])
    expect(d.colunas.map((c) => c.contagem)).toEqual([5, 4, 4, 4, 4, 3])
  })

  it('calcularMetricas agrega tudo com o total correto', () => {
    const m = calcularMetricas(FIX, 'tudo')
    expect(m.totalConcursos).toBe(4)
    expect(m.frequencia).toHaveLength(60)
    expect(m.soma.min).toBe(21)
  })
})
