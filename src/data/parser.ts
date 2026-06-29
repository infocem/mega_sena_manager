// Parsing/validação puros — sem I/O. Convertem as formas cruas (seed compacto
// ou resposta da API) no tipo de domínio Concurso, descartando entradas inválidas.
import type { CaixaConcursoRaw, Concurso, SeedEntry } from '../types'

/** Um Concurso válido: 6 dezenas únicas no intervalo 1–60. */
export function isValidConcurso(c: Concurso): boolean {
  if (!Number.isInteger(c.numero) || c.numero < 1) return false
  if (c.dezenas.length !== 6) return false
  const unicas = new Set(c.dezenas)
  if (unicas.size !== 6) return false
  return c.dezenas.every((d) => Number.isInteger(d) && d >= 1 && d <= 60)
}

function ordenar(dezenas: number[]): number[] {
  return [...dezenas].sort((a, b) => a - b)
}

/** Converte uma entrada compacta do seed. Retorna null se inválida. */
export function parseSeedEntry(e: SeedEntry): Concurso | null {
  const concurso: Concurso = {
    numero: Number(e.n),
    data: String(e.d ?? ''),
    dezenas: ordenar((e.z ?? []).map(Number)),
  }
  return isValidConcurso(concurso) ? concurso : null
}

/** Converte a resposta crua da API da Caixa. Retorna null se inválida. */
export function parseCaixaRaw(raw: CaixaConcursoRaw): Concurso | null {
  const concurso: Concurso = {
    numero: Number(raw.numero),
    data: String(raw.dataApuracao ?? ''),
    dezenas: ordenar((raw.listaDezenas ?? []).map(Number)),
  }
  return isValidConcurso(concurso) ? concurso : null
}

/** Parseia uma lista de entradas seed, descartando inválidas e ordenando por número. */
export function parseSeedEntries(entries: SeedEntry[]): Concurso[] {
  const out: Concurso[] = []
  for (const e of entries) {
    const c = parseSeedEntry(e)
    if (c) out.push(c)
  }
  out.sort((a, b) => a.numero - b.numero)
  return out
}
