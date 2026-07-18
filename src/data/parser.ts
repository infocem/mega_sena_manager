// Parsing/validação puros — sem I/O. Convertem as formas cruas (seed compacto
// ou resposta da API) no tipo de domínio Concurso, descartando entradas inválidas.
import type { LoteriaConfig } from '../config/loterias'
import { megasenaConfig } from '../config/megasena'
import type { CaixaConcursoRaw, Concurso, SeedEntry } from '../types'

/** Verifica se um Concurso é válido para a configuração informada (Mega-Sena por padrão). */
export function isValidConcurso(
  c: Concurso,
  config: LoteriaConfig = megasenaConfig,
): boolean {
  if (!Number.isInteger(c.numero) || c.numero < 1) return false
  if (c.dezenas.length < config.dezenasMin || c.dezenas.length > config.dezenasMax)
    return false
  const unicas = new Set(c.dezenas)
  if (unicas.size !== c.dezenas.length) return false
  return c.dezenas.every(
    (d) => Number.isInteger(d) && d >= config.faixaMin && d <= config.faixaMax,
  )
}

function ordenar(dezenas: number[]): number[] {
  return [...dezenas].sort((a, b) => a - b)
}

/** Converte uma entrada compacta do seed. Retorna null se inválida. */
export function parseSeedEntry(
  e: SeedEntry,
  config: LoteriaConfig = megasenaConfig,
): Concurso | null {
  const concurso: Concurso = {
    numero: Number(e.n),
    data: String(e.d ?? ''),
    dezenas: ordenar((e.z ?? []).map(Number)),
  }
  return isValidConcurso(concurso, config) ? concurso : null
}

/** Converte a resposta crua da API da Caixa. Retorna null se inválida. */
export function parseCaixaRaw(
  raw: CaixaConcursoRaw,
  config: LoteriaConfig = megasenaConfig,
): Concurso | null {
  const concurso: Concurso = {
    numero: Number(raw.numero),
    data: String(raw.dataApuracao ?? ''),
    dezenas: ordenar((raw.listaDezenas ?? []).map(Number)),
  }
  return isValidConcurso(concurso, config) ? concurso : null
}

/** Parseia uma lista de entradas seed, descartando inválidas e ordenando por número. */
export function parseSeedEntries(
  entries: SeedEntry[],
  config: LoteriaConfig = megasenaConfig,
): Concurso[] {
  const out: Concurso[] = []
  for (const e of entries) {
    const c = parseSeedEntry(e, config)
    if (c) out.push(c)
  }
  out.sort((a, b) => a.numero - b.numero)
  return out
}
