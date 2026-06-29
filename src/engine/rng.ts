// PRNG determinístico com seed (mulberry32). Injetável no gerador para tornar
// a geração reproduzível e testável: mesma seed ⇒ mesma sequência.

export type RNG = () => number

/** Gera uma função RNG em [0,1) a partir de uma seed inteira de 32 bits. */
export function mulberry32(seed: number): RNG {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Inteiro uniforme em [0, n). */
export function intAte(rng: RNG, n: number): number {
  return Math.floor(rng() * n)
}

/**
 * Escolha ponderada de um índice a partir de pesos não-negativos.
 * Retorna -1 se a soma dos pesos for 0.
 */
export function escolherPonderado(rng: RNG, pesos: number[]): number {
  let total = 0
  for (const p of pesos) total += p > 0 ? p : 0
  if (total <= 0) return -1
  let alvo = rng() * total
  for (let i = 0; i < pesos.length; i++) {
    const p = pesos[i] > 0 ? pesos[i] : 0
    if (p <= 0) continue
    alvo -= p
    if (alvo < 0) return i
  }
  // fallback por arredondamento: último índice com peso > 0
  for (let i = pesos.length - 1; i >= 0; i--) if (pesos[i] > 0) return i
  return -1
}
