// Cache local em IndexedDB (via idb-keyval). Estratégia:
//  1ª carga  -> popula com o seed de arquivo (uma vez) e persiste.
//  recargas  -> carrega do cache e busca SÓ os concursos novos via API.
import { get, set } from 'idb-keyval'
import { carregarSeed } from './seed'
import { fetchNovos, type FetchOpts } from '../api/caixa'
import type { Concurso } from '../types'

const CHAVE = 'megasena:concursos:v1'

/** Dependências injetáveis (facilita teste sem IndexedDB/rede reais). */
export interface CacheDeps {
  getCache?: (chave: string) => Promise<Concurso[] | undefined>
  setCache?: (chave: string, valor: Concurso[]) => Promise<void>
  seed?: () => Concurso[]
  buscarNovos?: typeof fetchNovos
}

export interface CarregarResultado {
  concursos: Concurso[]
  origem: 'seed' | 'cache'
  novos: number
}

function ordenarUnicos(concursos: Concurso[]): Concurso[] {
  const porNumero = new Map<number, Concurso>()
  for (const c of concursos) porNumero.set(c.numero, c)
  return [...porNumero.values()].sort((a, b) => a.numero - b.numero)
}

/**
 * Carrega os concursos: usa o cache se existir (e atualiza incrementalmente),
 * senão popula a partir do seed de arquivo e persiste.
 */
export async function carregarConcursos(
  opts: { fetch?: FetchOpts; onProgresso?: (feito: number, total: number) => void } = {},
  deps: CacheDeps = {},
): Promise<CarregarResultado> {
  const getCache = deps.getCache ?? ((c) => get<Concurso[]>(c))
  const setCache = deps.setCache ?? ((c, v) => set(c, v))
  const seed = deps.seed ?? carregarSeed
  const buscarNovos = deps.buscarNovos ?? fetchNovos

  const cacheado = await getCache(CHAVE)
  let base: Concurso[]
  let origem: 'seed' | 'cache'

  if (cacheado && cacheado.length > 0) {
    base = ordenarUnicos(cacheado)
    origem = 'cache'
  } else {
    base = ordenarUnicos(seed())
    origem = 'seed'
    await setCache(CHAVE, base)
  }

  const ultimoCacheado = base.length ? base[base.length - 1].numero : 0
  let novos: Concurso[] = []
  try {
    novos = await buscarNovos(ultimoCacheado, {
      ...opts.fetch,
      onProgresso: opts.onProgresso,
    })
  } catch {
    // sem rede: segue só com o que está em cache/seed
    novos = []
  }

  if (novos.length) {
    base = ordenarUnicos([...base, ...novos])
    await setCache(CHAVE, base)
  }

  return { concursos: base, origem, novos: novos.length }
}
