// Estatística descritiva sobre o histórico — funções PURAS e testáveis.
// Honestidade: descrevem o passado; não implicam probabilidade futura.
import type {
  AtrasoItem,
  Concurso,
  DistribuicaoLinhasColunas,
  FrequenciaItem,
  Janela,
  Metricas,
  ParImparItem,
  SomaStats,
} from '../types'

export const TOTAL_DEZENAS = 60
// Volante físico da Mega-Sena: 10 linhas × 6 colunas (linha k = dezenas 6k+1..6k+6).
const LINHAS = 10
const COLUNAS = 6

/** Recorta os N concursos mais recentes (lista assumida em ordem crescente). */
export function aplicarJanela(concursos: Concurso[], janela: Janela): Concurso[] {
  if (janela === 'tudo') return concursos
  const n = Math.max(0, Math.floor(janela))
  return n >= concursos.length ? concursos : concursos.slice(concursos.length - n)
}

/** Percentil por interpolação linear (estilo numpy 'linear'). arr ordenado asc. */
export function percentil(ordenado: number[], p: number): number {
  if (ordenado.length === 0) return 0
  if (ordenado.length === 1) return ordenado[0]
  const idx = p * (ordenado.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  const frac = idx - lo
  return ordenado[lo] + (ordenado[hi] - ordenado[lo]) * frac
}

/** Frequência de cada dezena (1–60) na janela. Ordenado por dezena. */
export function frequencia(concursos: Concurso[], janela: Janela): FrequenciaItem[] {
  const jan = aplicarJanela(concursos, janela)
  const cont = new Array<number>(TOTAL_DEZENAS + 1).fill(0)
  for (const c of jan) for (const d of c.dezenas) cont[d]++
  const out: FrequenciaItem[] = []
  for (let d = 1; d <= TOTAL_DEZENAS; d++) out.push({ dezena: d, contagem: cont[d] })
  return out
}

/**
 * Atraso de cada dezena: nº de concursos decorridos desde a última saída,
 * dentro da janela. 0 = saiu no concurso mais recente; tamanho da janela = nunca
 * saiu na janela.
 */
export function atraso(concursos: Concurso[], janela: Janela): AtrasoItem[] {
  const jan = aplicarJanela(concursos, janela)
  const total = jan.length
  const ultimaPos = new Array<number>(TOTAL_DEZENAS + 1).fill(-1)
  jan.forEach((c, pos) => {
    for (const d of c.dezenas) ultimaPos[d] = pos
  })
  const out: AtrasoItem[] = []
  for (let d = 1; d <= TOTAL_DEZENAS; d++) {
    const pos = ultimaPos[d]
    out.push({ dezena: d, atraso: pos === -1 ? total : total - 1 - pos })
  }
  return out
}

/** Distribuição de quantidade de pares por concurso (0–6). */
export function parImpar(concursos: Concurso[], janela: Janela): ParImparItem[] {
  const jan = aplicarJanela(concursos, janela)
  const cont = new Array<number>(7).fill(0)
  for (const c of jan) {
    const pares = c.dezenas.filter((d) => d % 2 === 0).length
    cont[pares]++
  }
  return cont.map((contagem, pares) => ({ pares, contagem }))
}

/** Estatísticas da soma das 6 dezenas por concurso. */
export function somaStats(concursos: Concurso[], janela: Janela): SomaStats {
  const jan = aplicarJanela(concursos, janela)
  if (jan.length === 0) return { min: 0, max: 0, media: 0, mediana: 0, p10: 0, p90: 0 }
  const somas = jan.map((c) => c.dezenas.reduce((a, b) => a + b, 0)).sort((a, b) => a - b)
  const media = somas.reduce((a, b) => a + b, 0) / somas.length
  return {
    min: somas[0],
    max: somas[somas.length - 1],
    media,
    mediana: percentil(somas, 0.5),
    p10: percentil(somas, 0.1),
    p90: percentil(somas, 0.9),
  }
}

/** Distribuição das dezenas sorteadas pelas linhas/colunas do volante (6×10). */
export function distribuicaoLinhasColunas(
  concursos: Concurso[],
  janela: Janela,
): DistribuicaoLinhasColunas {
  const jan = aplicarJanela(concursos, janela)
  const linhas = new Array<number>(LINHAS).fill(0)
  const colunas = new Array<number>(COLUNAS).fill(0)
  for (const c of jan) {
    for (const d of c.dezenas) {
      linhas[Math.floor((d - 1) / COLUNAS)]++
      colunas[(d - 1) % COLUNAS]++
    }
  }
  return {
    linhas: linhas.map((contagem, i) => ({ indice: i + 1, contagem })),
    colunas: colunas.map((contagem, i) => ({ indice: i + 1, contagem })),
  }
}

/** Agrega todas as métricas para uma janela. */
export function calcularMetricas(concursos: Concurso[], janela: Janela): Metricas {
  const jan = aplicarJanela(concursos, janela)
  return {
    totalConcursos: jan.length,
    frequencia: frequencia(concursos, janela),
    atraso: atraso(concursos, janela),
    parImpar: parImpar(concursos, janela),
    soma: somaStats(concursos, janela),
    distribuicao: distribuicaoLinhasColunas(concursos, janela),
  }
}
