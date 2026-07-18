// Motor de sugestão. Honestidade: a geração NÃO prevê resultados; apenas
// monta seleções diversificadas de forma transparente, com critério explícito.
//
// Pipeline por jogo: amostragem ponderada (quentes/atrasadas/aleatório com RNG
// injetado) → montar candidato de N dezenas → validar filtros estruturais →
// repetir até obter N jogos distintos. Ao estourar o máx-tentativas, relaxa
// progressivamente o filtro mais restritivo (evita loop infinito).
import type { Config, Jogo, Metricas } from '../types'
import type { LoteriaConfig } from '../config/loterias'
import { megasenaConfig } from '../config/megasena'
import { escolherPonderado, mulberry32, type RNG } from './rng'

const MAX_TENTATIVAS_POR_NIVEL = 200

/**
 * Níveis de relaxamento, do mais restritivo (0 = todos os filtros) ao menos.
 * Cada nível desativa mais um filtro, na ordem em que tendem a rejeitar mais
 * candidatos. O nível final mantém só a validade (dezenas únicas dentro da
 * faixa), garantindo terminação.
 *
 * Ordem fixa de relaxamento: espalhamento → soma → sequenciais → parImpar.
 * Essa sequência é uma decisão empírica do motor: remove primeiro o filtro que
 * mais costuma rejeitar candidatos, deixando os mais brandos por último.
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

/** Faixa de soma derivada dos dados (percentis), não hardcoded. */
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

function linhasDistintas(dezenas: number[], config: LoteriaConfig): number {
  const linhas = new Set(dezenas.map((d) => Math.floor((d - 1) / config.colunas)))
  return linhas.size
}

/** Valida os filtros estruturais ativos para o nível de relaxamento dado. */
export function validarCandidato(
  dezenas: number[],
  faixa: FaixaSoma,
  nivelRelaxamento: number,
  loteriaConfig: LoteriaConfig = megasenaConfig,
): boolean {
  // validade base — sempre exigida
  if (dezenas.length !== loteriaConfig.dezenasMin) return false
  if (new Set(dezenas).size !== loteriaConfig.dezenasMin) return false
  if (!dezenas.every((d) => d >= loteriaConfig.faixaMin && d <= loteriaConfig.faixaMax)) return false

  const ativo = (filtro: (typeof FILTRO_POR_NIVEL)[number]) => {
    const idx = FILTRO_POR_NIVEL.indexOf(filtro)
    return nivelRelaxamento <= idx
  }
  const ordenado = [...dezenas].sort((a, b) => a - b)

  if (ativo('parImpar')) {
    const pares = contarPares(ordenado)
    if (pares < loteriaConfig.filtros.parImpar.min || pares > loteriaConfig.filtros.parImpar.max) return false
  }
  if (ativo('sequenciais')) {
    if (maiorSequencia(ordenado) > loteriaConfig.filtros.sequenciais.maxConsecutivos) return false
  }
  if (ativo('soma')) {
    const soma = ordenado.reduce((a, b) => a + b, 0)
    if (soma < faixa.min || soma > faixa.max) return false
  }
  if (ativo('espalhamento')) {
    if (linhasDistintas(ordenado, loteriaConfig) < loteriaConfig.filtros.espalhamento.minLinhas) return false
  }
  return true
}

/** Pesos por dezena (índice 1..faixaMax) a partir das métricas e dos pesos da config. */
export function pesosPorDezena(
  metricas: Metricas,
  config: Config,
  loteriaConfig: LoteriaConfig = megasenaConfig,
): number[] {
  const totalDezenas = loteriaConfig.faixaMax - loteriaConfig.faixaMin + 1
  const freq = new Array<number>(loteriaConfig.faixaMax + 1).fill(0)
  const atr = new Array<number>(loteriaConfig.faixaMax + 1).fill(0)
  for (const f of metricas.frequencia) freq[f.dezena] = f.contagem
  for (const a of metricas.atraso) atr[a.dezena] = a.atraso

  const somaFreq = freq.reduce((a, b) => a + b, 0) || 1
  const somaAtr = atr.reduce((a, b) => a + b, 0) || 1

  const { quentes, atrasadas, aleatorio } = config.pesos
  const somaPesos = quentes + atrasadas + aleatorio || 1
  const pq = quentes / somaPesos
  const pa = atrasadas / somaPesos
  const pr = aleatorio / somaPesos

  const pesos = new Array<number>(loteriaConfig.faixaMax + 1).fill(0)
  for (let d = loteriaConfig.faixaMin; d <= loteriaConfig.faixaMax; d++) {
    const distFreq = freq[d] / somaFreq
    const distAtr = atr[d] / somaAtr
    const distUnif = 1 / totalDezenas
    // mistura + piso pequeno para nunca zerar uma dezena elegível
    pesos[d] = pq * distFreq + pa * distAtr + pr * distUnif + 1e-9
  }
  return pesos
}

/** Amostra N dezenas distintas por seleção ponderada sem reposição. */
function amostrarJogo(
  pesosBase: number[],
  rng: RNG,
  loteriaConfig: LoteriaConfig = megasenaConfig,
): number[] {
  const pesos = [...pesosBase]
  const escolhidas: number[] = []
  for (let i = 0; i < loteriaConfig.dezenasMin; i++) {
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

function resolverFaixaSoma(metricas: Metricas, loteriaConfig: LoteriaConfig): FaixaSoma {
  const soma = loteriaConfig.filtros.soma
  if (soma.tipo === 'absoluto') {
    return { min: soma.min, max: soma.max }
  }
  return faixaSomaDosDados(metricas)
}

/**
 * Gera N jogos distintos válidos. `rng` é injetável; se ausente, usa
 * mulberry32(config.seed) → resultado determinístico para a mesma seed.
 */
export function gerarJogos(
  metricas: Metricas,
  config: Config,
  rng?: RNG,
  loteriaConfig: LoteriaConfig = megasenaConfig,
): ResultadoGeracao {
  const gerador = rng ?? mulberry32(config.seed)
  const pesosBase = pesosPorDezena(metricas, config, loteriaConfig)
  const faixa = resolverFaixaSoma(metricas, loteriaConfig)
  const { criterio, base } = descreverCriterio(config)
  const explicacaoBase =
    `Critério ${criterio} (${base}). Seleção ponderada com filtros estruturais ` +
    `(${loteriaConfig.filtros.parImpar.min}–${loteriaConfig.filtros.parImpar.max} pares, soma na faixa ${faixa.min}–${faixa.max}, sem ${loteriaConfig.filtros.sequenciais.maxConsecutivos + 1}+ sequenciais, espalhamento). ` +
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
        const cand = amostrarJogo(pesosBase, gerador, loteriaConfig)
        if (!validarCandidato(cand, faixa, nivel, loteriaConfig)) continue
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
