// Domínio da Mega-Sena.
// Premissa central: honestidade estatística — nada aqui prevê resultados;
// apenas descreve o histórico e diversifica seleções de forma transparente.

/** Um concurso já apurado, normalizado a partir do seed ou da API. */
export interface Concurso {
  numero: number
  /** Data de apuração no formato DD/MM/AAAA (como vem da Caixa). */
  data: string
  /** 6 dezenas (1–60), ordenadas crescente. */
  dezenas: number[]
}

/** Resposta crua da API oficial da Caixa (campos relevantes). */
export interface CaixaConcursoRaw {
  numero: number
  dataApuracao: string
  listaDezenas: string[]
  numeroConcursoProximo: number | null
}

/** Entrada compacta no arquivo seed versionado (src/data/megasena-seed.json). */
export interface SeedEntry {
  n: number
  d: string
  z: number[]
}

export interface SeedFile {
  fonte: string
  ultimo: number
  concursos: SeedEntry[]
}

/** Janela de análise: número de concursos mais recentes, ou todo o histórico. */
export type Janela = number | 'tudo'

export interface FrequenciaItem {
  dezena: number
  /** Quantas vezes saiu na janela. */
  contagem: number
}

export interface AtrasoItem {
  dezena: number
  /** Concursos decorridos desde a última vez que a dezena saiu. */
  atraso: number
}

export interface ParImparItem {
  /** Quantidade de dezenas pares no jogo (0–6). */
  pares: number
  /** Quantos concursos da janela tiveram essa contagem de pares. */
  contagem: number
}

export interface SomaStats {
  min: number
  max: number
  media: number
  mediana: number
  p10: number
  p90: number
}

export interface DistribuicaoCelula {
  indice: number
  contagem: number
}

export interface DistribuicaoLinhasColunas {
  linhas: DistribuicaoCelula[]
  colunas: DistribuicaoCelula[]
}

export interface Metricas {
  totalConcursos: number
  frequencia: FrequenciaItem[]
  atraso: AtrasoItem[]
  parImpar: ParImparItem[]
  soma: SomaStats
  distribuicao: DistribuicaoLinhasColunas
}

/** Pesos da amostragem ponderada (relativos; normalizados internamente). */
export interface Pesos {
  quentes: number
  atrasadas: number
  aleatorio: number
}

export interface Config {
  qtdJogos: number
  janela: Janela
  pesos: Pesos
  /** Seed do PRNG — fixa torna a geração reproduzível/testável. */
  seed: number
}

export interface Jogo {
  dezenas: number[]
  criterio: string
  explicacao: string
}
