// Gerenciador de seeds multi-loteria.
// Abstrai o carregamento dos arquivos seed versionados (src/data/*-seed.json)
// por identificador de loteria, mantendo compatibilidade com `seed.ts`.
import { megasenaConfig } from '../config/megasena'
import { lotofacilConfig } from '../config/lotofacil'
import type { LoteriaConfig } from '../config/loterias'
import { parseSeedEntries } from './parser'
import type { Concurso, SeedFile } from '../types'

/** IDs de loteria suportados pelo gerenciador de seeds. */
export type LoteriaId = 'megasena' | 'lotofacil'

const configsPorLoteria: Record<LoteriaId, LoteriaConfig> = {
  megasena: megasenaConfig,
  lotofacil: lotofacilConfig,
}

function isLoteriaIdSuportada(id: string): id is LoteriaId {
  return id in configsPorLoteria
}

/** Retorna o nome do arquivo seed para uma loteria. */
function nomeArquivoSeed(loteriaId: LoteriaId): string {
  return `./${loteriaId}-seed.json`
}

/** Carrega o conteúdo bruto do arquivo seed de forma dinâmica.
 *  Lança erro se o arquivo não existir ou não puder ser importado. */
async function importarSeedFile(loteriaId: LoteriaId): Promise<SeedFile> {
  const modulo = await import(nomeArquivoSeed(loteriaId))
  return modulo.default as SeedFile
}

/** Classe responsável por carregar e cachear seeds de várias loterias. */
export class SeedManager {
  private cache = new Map<LoteriaId, Concurso[]>()

  /** Carrega o seed de uma loteria específica.
   *  Usa cache em memória para evitar imports repetidos.
   *  Retorna array vazio se o arquivo seed estiver ausente. */
  async carregar(loteriaId: string): Promise<Concurso[]> {
    if (!isLoteriaIdSuportada(loteriaId)) {
      throw new Error(`Loteria não suportada: "${loteriaId}"`)
    }

    const cached = this.cache.get(loteriaId)
    if (cached) return cached

    const config = configsPorLoteria[loteriaId]

    try {
      const seedFile = await importarSeedFile(loteriaId)
      const concursos = parseSeedEntries(seedFile.concursos, config)
      this.cache.set(loteriaId, concursos)
      return concursos
    } catch (erro) {
      // Arquivo seed ausente ou falha de importação: retorna array vazio
      // sem quebrar consumidores que ainda não precisam dessa loteria.
      console.warn(`Seed não encontrado para "${loteriaId}":`, erro)
      return []
    }
  }

  /** Remove o cache em memória de uma loteria (ou todas se omitido). */
  limparCache(loteriaId?: LoteriaId): void {
    if (loteriaId) {
      this.cache.delete(loteriaId)
    } else {
      this.cache.clear()
    }
  }
}

/** Instância padrão do gerenciador para uso direto. */
export const seedManager = new SeedManager()

/** Carrega o seed para a loteria informada.
 *  Facade simples sobre `SeedManager.carregar`.
 *  Retorna array vazio quando o seed da loteria ainda não existe. */
export async function carregarSeedPorLoteria(loteriaId: string): Promise<Concurso[]> {
  return seedManager.carregar(loteriaId)
}
