import { describe, expect, it } from 'vitest'
import { faixaSomaDosDados, gerarJogos, validarCandidato } from './generator'
import { mulberry32 } from './rng'
import type { Config, Metricas, SomaStats } from '../types'

// Métricas sintéticas uniformes — sampling ~uniforme; soma parametrizável.
function metricasUniformes(soma: Partial<SomaStats> = {}): Metricas {
  const frequencia = Array.from({ length: 60 }, (_, i) => ({ dezena: i + 1, contagem: 1 }))
  const atraso = Array.from({ length: 60 }, (_, i) => ({ dezena: i + 1, atraso: 1 }))
  return {
    totalConcursos: 100,
    frequencia,
    atraso,
    parImpar: [],
    soma: { min: 21, max: 345, media: 183, mediana: 183, p10: 100, p90: 250, ...soma },
    distribuicao: { linhas: [], colunas: [] },
  }
}

const config = (over: Partial<Config> = {}): Config => ({
  qtdJogos: 5,
  janela: 'tudo',
  pesos: { quentes: 1, atrasadas: 1, aleatorio: 1 },
  seed: 42,
  ...over,
})

describe('generator', () => {
  it('faixaSomaDosDados deriva da soma (percentis), não hardcoded', () => {
    const f = faixaSomaDosDados(metricasUniformes({ p10: 110, p90: 240 }))
    expect(f).toEqual({ min: 110, max: 240 })
  })

  it('gera N jogos válidos (6 dezenas únicas 1–60) respeitando filtros', () => {
    const { jogos } = gerarJogos(metricasUniformes(), config(), mulberry32(42))
    expect(jogos).toHaveLength(5)
    for (const j of jogos) {
      expect(j.dezenas).toHaveLength(6)
      expect(new Set(j.dezenas).size).toBe(6)
      expect(j.dezenas.every((d) => d >= 1 && d <= 60)).toBe(true)
      // filtros estruturais (nível 0)
      const pares = j.dezenas.filter((d) => d % 2 === 0).length
      expect(pares).toBeGreaterThanOrEqual(2)
      expect(pares).toBeLessThanOrEqual(4)
      const soma = j.dezenas.reduce((a, b) => a + b, 0)
      expect(soma).toBeGreaterThanOrEqual(100)
      expect(soma).toBeLessThanOrEqual(250)
      expect(j.criterio).toBeTruthy()
      expect(j.explicacao).toContain('NÃO aumenta')
    }
  })

  it('jogos são distintos entre si', () => {
    const { jogos } = gerarJogos(metricasUniformes(), config({ qtdJogos: 8 }), mulberry32(7))
    const chaves = new Set(jogos.map((j) => j.dezenas.join('-')))
    expect(chaves.size).toBe(jogos.length)
  })

  it('é determinístico com seed fixa', () => {
    const a = gerarJogos(metricasUniformes(), config(), mulberry32(123))
    const b = gerarJogos(metricasUniformes(), config(), mulberry32(123))
    expect(a.jogos.map((j) => j.dezenas)).toEqual(b.jogos.map((j) => j.dezenas))
  })

  it('seeds diferentes produzem conjuntos diferentes', () => {
    const a = gerarJogos(metricasUniformes(), config(), mulberry32(1))
    const b = gerarJogos(metricasUniformes(), config(), mulberry32(2))
    expect(a.jogos.map((j) => j.dezenas)).not.toEqual(b.jogos.map((j) => j.dezenas))
  })

  it('sem rng explícito usa config.seed (determinístico)', () => {
    const a = gerarJogos(metricasUniformes(), config({ seed: 555 }))
    const b = gerarJogos(metricasUniformes(), config({ seed: 555 }))
    expect(a.jogos.map((j) => j.dezenas)).toEqual(b.jogos.map((j) => j.dezenas))
  })

  it('relaxa filtros sem travar quando a faixa de soma é impossível', () => {
    // soma máxima de 6 dezenas distintas (1–60) é 345; faixa 400–401 é impossível
    const m = metricasUniformes({ p10: 400, p90: 401 })
    const { jogos, relaxamentoMaximo } = gerarJogos(m, config(), mulberry32(9))
    expect(jogos).toHaveLength(5) // ainda entrega N jogos
    expect(relaxamentoMaximo).toBeGreaterThanOrEqual(2) // precisou relaxar a soma
    for (const j of jogos) {
      expect(j.dezenas).toHaveLength(6)
      expect(new Set(j.dezenas).size).toBe(6)
    }
  })

  it('validarCandidato aplica/relaxa filtros por nível', () => {
    const faixa = { min: 100, max: 250 }
    // 4 sequenciais → reprovado no nível 0, aprovado quando sequenciais relaxa (nível 3)
    const seq = [3, 4, 5, 6, 30, 50] // soma 98 < 100 também
    expect(validarCandidato(seq, faixa, 0)).toBe(false)
    // candidato válido em todos os filtros
    const ok = [4, 13, 22, 35, 48, 59] // 3 pares, espalhado, soma 181
    expect(validarCandidato(ok, faixa, 0)).toBe(true)
    // dezena inválida sempre reprova
    expect(validarCandidato([0, 1, 2, 3, 4, 5], faixa, 4)).toBe(false)
  })
})
