import { describe, expect, it } from 'vitest'
import { faixaSomaDosDados, gerarJogos, validarCandidato } from './generator'
import { mulberry32 } from './rng'
import { megasenaConfig } from '../config/megasena'
import { lotofacilConfig } from '../config/lotofacil'
import type { Config, Metricas, SomaStats } from '../types'
import type { LoteriaConfig } from '../config/loterias'

// Métricas sintéticas uniformes para Mega-Sena (faixa 1–60).
function metricasMegaSena(soma: Partial<SomaStats> = {}): Metricas {
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

// Métricas sintéticas uniformes para Lotofácil (faixa 1–25).
function metricasLotofacil(soma: Partial<SomaStats> = {}): Metricas {
  const frequencia = Array.from({ length: 25 }, (_, i) => ({ dezena: i + 1, contagem: 1 }))
  const atraso = Array.from({ length: 25 }, (_, i) => ({ dezena: i + 1, atraso: 1 }))
  return {
    totalConcursos: 100,
    frequencia,
    atraso,
    parImpar: [],
    soma: { min: 120, max: 300, media: 195, mediana: 195, p10: 150, p90: 250, ...soma },
    distribuicao: { linhas: [], colunas: [] },
  }
}

const configBase = (over: Partial<Config> = {}): Config => ({
  qtdJogos: 5,
  janela: 'tudo',
  pesos: { quentes: 1, atrasadas: 1, aleatorio: 1 },
  seed: 42,
  ...over,
})

function contarPares(dezenas: number[]): number {
  return dezenas.filter((d) => d % 2 === 0).length
}

function maiorSequencia(dezenas: number[]): number {
  const ordenado = [...dezenas].sort((a, b) => a - b)
  let melhor = 1
  let atual = 1
  for (let i = 1; i < ordenado.length; i++) {
    if (ordenado[i] === ordenado[i - 1] + 1) atual++
    else atual = 1
    if (atual > melhor) melhor = atual
  }
  return melhor
}

function linhasDistintas(dezenas: number[], config: LoteriaConfig): number {
  return new Set(dezenas.map((d) => Math.floor((d - 1) / config.colunas))).size
}

describe('gerarJogos com Mega-Sena', () => {
  it('gera jogos quando recebe megasenaConfig explicitamente', () => {
    const { jogos } = gerarJogos(metricasMegaSena(), configBase(), mulberry32(42), megasenaConfig)
    expect(jogos).toHaveLength(5)
  })

  it('gera 6 dezenas únicas entre 1 e 60 para Mega-Sena', () => {
    const { jogos } = gerarJogos(metricasMegaSena(), configBase(), mulberry32(1), megasenaConfig)
    for (const j of jogos) {
      expect(j.dezenas).toHaveLength(6)
      expect(new Set(j.dezenas).size).toBe(6)
      expect(j.dezenas.every((d) => d >= 1 && d <= 60)).toBe(true)
    }
  })

  it('respeita filtros padrão da Mega-Sena (parImpar 2–4, sequenciais ≤3, espalhamento ≥3)', () => {
    const { jogos } = gerarJogos(metricasMegaSena(), configBase(), mulberry32(2), megasenaConfig)
    expect(jogos.length).toBeGreaterThan(0)
    for (const j of jogos) {
      const pares = contarPares(j.dezenas)
      expect(pares).toBeGreaterThanOrEqual(2)
      expect(pares).toBeLessThanOrEqual(4)
      expect(maiorSequencia(j.dezenas)).toBeLessThanOrEqual(3)
      expect(linhasDistintas(j.dezenas, megasenaConfig)).toBeGreaterThanOrEqual(3)
    }
  })

  it('mantém compatibilidade sem config (usa megasenaConfig por padrão)', () => {
    const { jogos } = gerarJogos(metricasMegaSena(), configBase(), mulberry32(3))
    expect(jogos).toHaveLength(5)
    for (const j of jogos) {
      expect(j.dezenas).toHaveLength(6)
      expect(j.dezenas.every((d) => d >= 1 && d <= 60)).toBe(true)
    }
  })

  it('usa faixa de soma percentil dos dados para Mega-Sena', () => {
    const { jogos } = gerarJogos(
      metricasMegaSena({ p10: 120, p90: 220 }),
      configBase(),
      mulberry32(4),
      megasenaConfig,
    )
    expect(jogos.length).toBeGreaterThan(0)
    for (const j of jogos) {
      const soma = j.dezenas.reduce((a, b) => a + b, 0)
      expect(soma).toBeGreaterThanOrEqual(120)
      expect(soma).toBeLessThanOrEqual(220)
    }
  })

  it('é determinístico com seed fixa para Mega-Sena', () => {
    const a = gerarJogos(metricasMegaSena(), configBase(), mulberry32(77), megasenaConfig)
    const b = gerarJogos(metricasMegaSena(), configBase(), mulberry32(77), megasenaConfig)
    expect(a.jogos.map((j) => j.dezenas)).toEqual(b.jogos.map((j) => j.dezenas))
  })
})

describe('gerarJogos com Lotofácil', () => {
  it('gera jogos quando recebe lotofacilConfig explicitamente', () => {
    const { jogos } = gerarJogos(metricasLotofacil(), configBase(), mulberry32(42), lotofacilConfig)
    expect(jogos).toHaveLength(5)
  })

  it('gera 15 dezenas únicas entre 1 e 25 para Lotofácil', () => {
    const { jogos } = gerarJogos(metricasLotofacil(), configBase(), mulberry32(5), lotofacilConfig)
    for (const j of jogos) {
      expect(j.dezenas).toHaveLength(15)
      expect(new Set(j.dezenas).size).toBe(15)
      expect(j.dezenas.every((d) => d >= 1 && d <= 25)).toBe(true)
    }
  })

  it('respeita filtros padrão da Lotofácil (parImpar 6–10, sequenciais ≤4, espalhamento ≥4)', () => {
    const { jogos } = gerarJogos(metricasLotofacil(), configBase(), mulberry32(6), lotofacilConfig)
    expect(jogos.length).toBeGreaterThan(0)
    for (const j of jogos) {
      const pares = contarPares(j.dezenas)
      expect(pares).toBeGreaterThanOrEqual(6)
      expect(pares).toBeLessThanOrEqual(10)
      expect(maiorSequencia(j.dezenas)).toBeLessThanOrEqual(4)
      expect(linhasDistintas(j.dezenas, lotofacilConfig)).toBeGreaterThanOrEqual(4)
    }
  })

  it('usa faixa de soma absoluta 150–300 para Lotofácil', () => {
    const { jogos } = gerarJogos(metricasLotofacil(), configBase(), mulberry32(7), lotofacilConfig)
    expect(jogos.length).toBeGreaterThan(0)
    for (const j of jogos) {
      const soma = j.dezenas.reduce((a, b) => a + b, 0)
      expect(soma).toBeGreaterThanOrEqual(150)
      expect(soma).toBeLessThanOrEqual(300)
    }
  })

  it('gera jogos distintos para Lotofácil', () => {
    const { jogos } = gerarJogos(
      metricasLotofacil(),
      configBase({ qtdJogos: 8 }),
      mulberry32(8),
      lotofacilConfig,
    )
    const chaves = new Set(jogos.map((j) => j.dezenas.join('-')))
    expect(chaves.size).toBe(jogos.length)
  })

  it('é determinístico com seed fixa para Lotofácil', () => {
    const a = gerarJogos(metricasLotofacil(), configBase(), mulberry32(88), lotofacilConfig)
    const b = gerarJogos(metricasLotofacil(), configBase(), mulberry32(88), lotofacilConfig)
    expect(a.jogos.map((j) => j.dezenas)).toEqual(b.jogos.map((j) => j.dezenas))
  })
})

describe('validarCandidato e comportamento dos filtros', () => {
  it('rejeita candidato quando parImpar está fora da faixa da Mega-Sena', () => {
    const faixa = { min: 100, max: 250 }
    const cincoPares = [2, 4, 6, 8, 30, 50] // 5 pares, demais filtros válidos
    expect(validarCandidato(cincoPares, faixa, 0, megasenaConfig)).toBe(false)
    const tresPares = [2, 4, 20, 31, 35, 45] // 2 pares, todos os filtros válidos
    expect(validarCandidato(tresPares, faixa, 0, megasenaConfig)).toBe(true)
  })

  it('rejeita candidato quando sequenciais ultrapassam o limite', () => {
    const faixa = { min: 100, max: 250 }
    const quatroSequenciais = [1, 2, 3, 4, 40, 50] // 4 consecutivos, demais filtros válidos
    expect(validarCandidato(quatroSequenciais, faixa, 0, megasenaConfig)).toBe(false)
    expect(validarCandidato(quatroSequenciais, faixa, 3, megasenaConfig)).toBe(true)
  })

  it('rejeita candidato quando soma está fora da faixa', () => {
    const faixa = { min: 100, max: 200 }
    const soSomaFora = [35, 37, 39, 50, 52, 55]
    expect(validarCandidato(soSomaFora, faixa, 0, megasenaConfig)).toBe(false)
    expect(validarCandidato(soSomaFora, faixa, 2, megasenaConfig)).toBe(true)
  })

  it('rejeita candidato quando espalhamento não atinge o mínimo de linhas', () => {
    const faixa = { min: 100, max: 250 }
    const soEspalhamentoBaixo = [11, 13, 15, 22, 24, 26]
    expect(validarCandidato(soEspalhamentoBaixo, faixa, 0, megasenaConfig)).toBe(false)
    expect(validarCandidato(soEspalhamentoBaixo, faixa, 1, megasenaConfig)).toBe(true)
  })

  it('aplica filtros da Lotofácil conforme sua configuração', () => {
    const faixa = { min: 150, max: 300 }
    // 11 pares (fora de 6–10), demais filtros válidos
    const onzePares = [1, 2, 4, 6, 8, 10, 13, 14, 16, 18, 20, 21, 22, 24, 25]
    expect(validarCandidato(onzePares, faixa, 0, lotofacilConfig)).toBe(false)
    // 5 consecutivos (fora do limite 4), demais filtros válidos
    const cincoSequenciais = [1, 2, 3, 4, 5, 8, 10, 12, 14, 16, 18, 20, 22, 23, 25]
    expect(validarCandidato(cincoSequenciais, faixa, 0, lotofacilConfig)).toBe(false)
    // 3 linhas distintas (abaixo do mínimo 4), demais filtros válidos
    const poucasLinhasLotofacil = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    expect(validarCandidato(poucasLinhasLotofacil, faixa, 0, lotofacilConfig)).toBe(false)
  })

  it('relaxa filtros na ordem fixa: espalhamento → soma → sequenciais → parImpar', () => {
    const faixaImpossivel = { min: 400, max: 401 }
    const validoMenosSoma = [10, 20, 30, 41, 45, 50]
    expect(validarCandidato(validoMenosSoma, faixaImpossivel, 0, megasenaConfig)).toBe(false)
    expect(validarCandidato(validoMenosSoma, faixaImpossivel, 1, megasenaConfig)).toBe(false)
    expect(validarCandidato(validoMenosSoma, faixaImpossivel, 2, megasenaConfig)).toBe(true)
  })

  it('suporta ambas as variantes de soma: percentil e absoluto', () => {
    const dados = metricasMegaSena({ p10: 110, p90: 230 })
    expect(faixaSomaDosDados(dados)).toEqual({ min: 110, max: 230 })

    const configAbsoluto: LoteriaConfig = {
      ...megasenaConfig,
      filtros: {
        ...megasenaConfig.filtros,
        soma: { tipo: 'absoluto', min: 130, max: 210 },
      },
    }
    const faixa = { min: 130, max: 210 }
    const dentroDaFaixa = [10, 20, 30, 41, 45, 50]
    const foraDaFaixa = [35, 37, 39, 50, 52, 55]
    expect(validarCandidato(dentroDaFaixa, faixa, 0, configAbsoluto)).toBe(true)
    expect(validarCandidato(foraDaFaixa, faixa, 0, configAbsoluto)).toBe(false)
  })
})

describe('casos extremos', () => {
  it('funciona com métricas vazias (frequência/atraso zerados)', () => {
    const vazias: Metricas = {
      totalConcursos: 0,
      frequencia: [],
      atraso: [],
      parImpar: [],
      soma: { min: 0, max: 0, media: 0, mediana: 0, p10: 100, p90: 250 },
      distribuicao: { linhas: [], colunas: [] },
    }
    const { jogos } = gerarJogos(vazias, configBase(), mulberry32(10), megasenaConfig)
    expect(jogos).toHaveLength(5)
    for (const j of jogos) {
      expect(j.dezenas).toHaveLength(6)
      expect(new Set(j.dezenas).size).toBe(6)
    }
  })

  it('entrega jogos mesmo com filtros muito restritivos', () => {
    const restritiva: LoteriaConfig = {
      ...megasenaConfig,
      filtros: {
        ...megasenaConfig.filtros,
        parImpar: { min: 6, max: 6 }, // exige todas as dezenas pares
      },
    }
    const { jogos } = gerarJogos(metricasMegaSena(), configBase(), mulberry32(11), restritiva)
    expect(jogos).toHaveLength(5)
    for (const j of jogos) {
      expect(j.dezenas).toHaveLength(6)
      expect(contarPares(j.dezenas)).toBe(6)
    }
  })

  it('relaxa ao máximo quando a soma é absolutamente impossível para Lotofácil', () => {
    const impossivel: LoteriaConfig = {
      ...lotofacilConfig,
      filtros: {
        ...lotofacilConfig.filtros,
        soma: { tipo: 'absoluto', min: 400, max: 500 },
      },
    }
    const { jogos, relaxamentoMaximo } = gerarJogos(
      metricasLotofacil(),
      configBase(),
      mulberry32(12),
      impossivel,
    )
    expect(jogos).toHaveLength(5)
    expect(relaxamentoMaximo).toBeGreaterThanOrEqual(2)
    for (const j of jogos) {
      expect(j.dezenas).toHaveLength(15)
      expect(new Set(j.dezenas).size).toBe(15)
    }
  })
})
