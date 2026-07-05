// Cliente da API oficial da Caixa (incremental). No browser passa pelo proxy de
// dev do Vite (/api/loterias -> servicebus2.caixa.gov.br/portaldeloterias/api),
// que contorna o CORS. No Android nativo, CapacitorHttp bypassa CORS via HTTP nativo.
// Robustez: retry com backoff exponencial, timeout por request e headers necessários.
import { parseCaixaRaw } from '../data/parser'
import type { CaixaConcursoRaw, Concurso } from '../types'
import { API_BASE } from './base'

const BASE = API_BASE
const TIMEOUT_MS = 15000
const MAX_TENTATIVAS = 5

export interface FetchOpts {
  /** Injetável para testes. */
  fetchImpl?: typeof fetch
  timeoutMs?: number
  maxTentativas?: number
  /** Atraso base do backoff (ms); injetável p/ testes rápidos. */
  baseBackoffMs?: number
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

async function buscarJson(
  url: string,
  opts: FetchOpts,
  tentativa = 0,
): Promise<CaixaConcursoRaw> {
  const fetchImpl = opts.fetchImpl ?? fetch
  const timeoutMs = opts.timeoutMs ?? TIMEOUT_MS
  const maxTentativas = opts.maxTentativas ?? MAX_TENTATIVAS
  const baseBackoff = opts.baseBackoffMs ?? 400
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetchImpl(url, {
        signal: ctrl.signal,
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return (await res.json()) as CaixaConcursoRaw
    } finally {
      clearTimeout(t)
    }
  } catch (err) {
    if (tentativa >= maxTentativas) throw err
    const backoff = Math.min(8000, baseBackoff * 2 ** tentativa)
    await sleep(backoff)
    return buscarJson(url, opts, tentativa + 1)
  }
}

/** Descobre o último concurso apurado. */
export async function fetchUltimo(opts: FetchOpts = {}): Promise<Concurso> {
  const raw = await buscarJson(BASE, opts)
  const c = parseCaixaRaw(raw)
  if (!c) throw new Error('Resposta inválida da API ao buscar último concurso')
  return c
}

/** Busca um concurso específico pelo número. */
export async function fetchConcurso(numero: number, opts: FetchOpts = {}): Promise<Concurso> {
  const raw = await buscarJson(`${BASE}/${numero}`, opts)
  const c = parseCaixaRaw(raw)
  if (!c) throw new Error(`Resposta inválida da API ao buscar concurso ${numero}`)
  return c
}

/**
 * Busca os concursos novos (numero > ultimoCacheado) até o último apurado.
 * Concorrência conservadora para não sobrecarregar a API.
 */
export async function fetchNovos(
  ultimoCacheado: number,
  opts: FetchOpts & { concorrencia?: number; onProgresso?: (feito: number, total: number) => void } = {},
): Promise<Concurso[]> {
  const ultimo = await fetchUltimo(opts)
  if (ultimo.numero <= ultimoCacheado) return []

  const pendentes: number[] = []
  for (let n = ultimoCacheado + 1; n < ultimo.numero; n++) pendentes.push(n)

  const concorrencia = Math.max(1, opts.concorrencia ?? 4)
  const novos: Concurso[] = [ultimo]
  const total = pendentes.length + 1
  let feito = 1
  opts.onProgresso?.(feito, total)

  const workers = Array.from({ length: concorrencia }, async () => {
    while (pendentes.length) {
      const n = pendentes.shift()!
      try {
        novos.push(await fetchConcurso(n, opts))
      } catch {
        // concurso novo indisponível agora: ignora; próxima recarga tenta de novo
      }
      opts.onProgresso?.(++feito, total)
    }
  })
  await Promise.all(workers)
  novos.sort((a, b) => a.numero - b.numero)
  return novos
}
