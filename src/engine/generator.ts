// Motor de sugestão. Honestidade: a geração NÃO prevê resultados; apenas
// monta seleções diversificadas de forma transparente, com critério explícito.
//
// Pipeline por jogo: amostragem ponderada (quentes/atrasadas/aleatório com RNG
// injetado) → montar candidato de 6 dezenas → validar filtros estruturais →
// repetir até obter N jogos distintos. Ao estourar o máx-tentativas, relaxa
// progressivamente o filtro mais restritivo (evita loop infinito).
import type { Config, Jogo, Metricas } from '../types'
import { escolherPonderado, mulberry32, type RNG } from './rng'

const TOTAL_DEZENAS = 60
const COLUNAS = 10
const MAX_TENTATIVAS_POR_NIVEL = 200

/**
 * Níveis de relaxamento, do mais restritivo (0 = todos os filtros) ao menos.
 * Cada nível desativa mais um filtro, na ordem em que tendem a rejeitar mais
 * candidatos. O nível final mantém só a validade (6 dezenas únicas 1–60),
 * garantindo terminação.
 */
const FILTRO_POR_NIVEL = [
  'espalhamento', // nível 0 exige todos; a partir do nível 1, espalhamento cai
  'soma', // nível 2: soma também relaxa
  'sequenciais', // nível 3: sequenciais também relaxa
  'parImpar', // nível 4: par/ímpar também relaxa → só validade
] as const

export interface FaixaSoma {
  min: number
  max: number
}

/** Faixa de soma derivada dos dados (percentis 10–90), não hardcoded. */
export function faixaSomaDosDados(metricas: Metricas): FaixaSoma {
  return { min: Math.round(metricas.soma.p10), max: Math.round(metricas.soma.p90) }
}

function contarPares(dezenas: number[]): number {
  return dezenas.filter((d) => d % 2 === 0).length
}

function maiorSequencia(ordenado: number[]): number {
  let melhor = 1
  let atual = 1
  for (let i = 1; i < ordenado.length; i++) {
    if (ordenado[i] === ordenado[i - 1] + 1) atual++
    else atual = 1
    if (atual > melhor) melhor = atual
  }
  return melhor
}

function linhasDistintas(dezenas: number[]): number {
  const linhas = new Set(dezenas.map((d) => Math.floor((d - 1) / COLUNAS)))
  return linhas.size
}

/** Valida os filtros estruturais ativos para o nível de relaxamento dado. */
export function validarCandidato(
  dezenas: number[],
  faixa: FaixaSoma,
  nivelRelaxamento: number,
): boolean {
  // validade base — sempre exigida
  if (dezenas.length !== 6) return false
  if (new Set(dezenas).size !== 6) return false
  if (!dezenas.every((d) => d >= 1 && d <= TOTAL_DEZENAS)) return false

  const ativo = (filtro: (typeof FILTRO_POR_NIVEL)[number]) => {
    const idx = FILTRO_POR_NIVEL.indexOf(filtro)
    return nivelRelaxamento <= idx
  }
  const ordenado = [...dezenas].sort((a, b) => a - b)

  if (ativo('parImpar')) {
    const pares = contarPares(ordenado)
    if (pares < 2 || pares > 4) return false
  }
  if (ativo('sequenciais')) {
    if (maiorSequencia(ordenado) >= 4) return false
  }
  if (ativo('soma')) {
    const soma = ordenado.reduce((a, b) => a + b, 0)
    if (soma < faixa.min || soma > faixa.max) return false
  }
  if (ativo('espalhamento')) {
    if (linhasDistintas(ordenado) < 3) return false
  }
  return true
}

/** Pesos por dezena (índice 1..60) a partir das métricas e dos pesos da config. */
export function pesosPorDezena(metricas: Metricas, config: Config): number[] {
  const freq = new Array<number>(TOTAL_DEZENAS + 1).fill(0)
  const atr = new Array<number>(TOTAL_DEZENAS + 1).fill(0)
  for (const f of metricas.frequencia) freq[f.dezena] = f.contagem
  for (const a of metricas.atraso) atr[a.dezena] = a.atraso

  const somaFreq = freq.reduce((a, b) => a + b, 0) || 1
  const somaAtr = atr.reduce((a, b) => a + b, 0) || 1

  const { quentes, atrasadas, aleatorio } = config.pesos
  const somaPesos = quentes + atrasadas + aleatorio || 1
  const pq = quentes / somaPesos
  const pa = atrasadas / somaPesos
  const pr = aleatorio / somaPesos

  const pesos = new Array<number>(TOTAL_DEZENAS + 1).fill(0)
  for (let d = 1; d <= TOTAL_DEZENAS; d++) {
    const distFreq = freq[d] / somaFreq
    const distAtr = atr[d] / somaAtr
    const distUnif = 1 / TOTAL_DEZENAS
    // mistura + piso pequeno para nunca zerar uma dezena elegível
    pesos[d] = pq * distFreq + pa * distAtr + pr * distUnif + 1e-9
  }
  return pesos
}

/** Amostra 6 dezenas distintas por seleção ponderada sem reposição. */
function amostrarJogo(pesosBase: number[], rng: RNG): number[] {
  const pesos = [...pesosBase]
  const escolhidas: number[] = []
  for (let i = 0; i < 6; i++) {
    const idx = escolherPonderado(rng, pesos)
    if (idx < 0) break
    escolhidas.push(idx)
    pesos[idx] = 0 // sem reposição
  }
  return escolhidas.sort((a, b) => a - b)
}

function descreverCriterio(config: Config): { criterio: string; base: string } {
  const { quentes, atrasadas, aleatorio } = config.pesos
  const max = Math.max(quentes, atrasadas, aleatorio)
  let criterio = 'Misto'
  if (max === quentes && quentes > atrasadas && quentes > aleatorio) criterio = 'Quentes'
  else if (max === atrasadas && atrasadas > quentes && atrasadas > aleatorio) criterio = 'Atrasadas'
  else if (max === aleatorio && aleatorio > quentes && aleatorio > atrasadas) criterio = 'Aleatório'
  const total = quentes + atrasadas + aleatorio || 1
  const pct = (v: number) => Math.round((v / total) * 100)
  const base = `quentes ${pct(quentes)}% · atrasadas ${pct(atrasadas)}% · aleatório ${pct(aleatorio)}%`
  return { criterio, base }
}

export interface ResultadoGeracao {
  jogos: Jogo[]
  /** Maior nível de relaxamento que foi necessário (0 = nenhum). */
  relaxamentoMaximo: number
}

/**
 * Gera N jogos distintos válidos. `rng` é injetável; se ausente, usa
 * mulberry32(config.seed) → resultado determinístico para a mesma seed.
 */
export function gerarJogos(metricas: Metricas, config: Config, rng?: RNG): ResultadoGeracao {
  const gerador = rng ?? mulberry32(config.seed)
  const pesosBase = pesosPorDezena(metricas, config)
  const faixa = faixaSomaDosDados(metricas)
  const { criterio, base } = descreverCriterio(config)
  const explicacaoBase =
    `Critério ${criterio} (${base}). Seleção ponderada com filtros estruturais ` +
    `(2–4 pares, soma na faixa ${faixa.min}–${faixa.max}, sem 4+ sequenciais, espalhamento). ` +
    `Isto NÃO aumenta a chance real de acerto — é apenas diversificação transparente.`

  const jogos: Jogo[] = []
  const vistos = new Set<string>()
  const qtd = Math.max(1, Math.floor(config.qtdJogos))
  let relaxamentoMaximo = 0

  while (jogos.length < qtd) {
    let nivel = 0
    let aceito: number[] | null = null
    // sobe o nível de relaxamento até conseguir um candidato válido e inédito
    while (nivel <= FILTRO_POR_NIVEL.length && aceito === null) {
      for (let t = 0; t < MAX_TENTATIVAS_POR_NIVEL; t++) {
        const cand = amostrarJogo(pesosBase, gerador)
        if (!validarCandidato(cand, faixa, nivel)) continue
        const chave = cand.join('-')
        if (vistos.has(chave)) continue
        aceito = cand
        break
      }
      if (aceito === null) {
        nivel++
        if (nivel > relaxamentoMaximo) relaxamentoMaximo = nivel
      }
    }
    if (aceito === null) break // proteção extra (não deve ocorrer)
    vistos.add(aceito.join('-'))
    jogos.push({
      dezenas: aceito,
      criterio,
      explicacao:
        nivel > 0
          ? `${explicacaoBase} (alguns filtros foram relaxados por escassez de candidatos)`
          : explicacaoBase,
    })
  }

  return { jogos, relaxamentoMaximo }
}
