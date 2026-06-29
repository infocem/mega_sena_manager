// Carrega o histórico seed versionado (resultados oficiais da Caixa) e o
// converte em Concurso[]. Usado uma única vez na primeira carga para popular
// o IndexedDB, evitando ~3000 requisições à API no primeiro uso.
import seedJson from './megasena-seed.json'
import { parseSeedEntries } from './parser'
import type { Concurso, SeedFile } from '../types'

const seedFile = seedJson as SeedFile

/** Concursos do seed, validados e ordenados por número. */
export function carregarSeed(): Concurso[] {
  return parseSeedEntries(seedFile.concursos)
}

export const seedMeta = {
  fonte: seedFile.fonte,
  ultimo: seedFile.ultimo,
  total: seedFile.concursos.length,
}
