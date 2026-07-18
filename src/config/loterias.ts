// Configurações específicas de cada loteria.
// Centraliza regras e limites hoje hardcoded no gerador e nas métricas.

/** Configuração de filtros estruturais aplicados a cada candidato de jogo. */
export interface FiltrosConfig {
  /** Quantidade de dezenas pares permitidas no jogo (ex: 2–4). */
  parImpar: {
    min: number
    max: number
  }

  /** Limite de dezenas consecutivas permitidas no jogo. */
  sequenciais: {
    /** Maior sequência de dezenas consecutivas aceita (ex: 3 proíbe 4+). */
    maxConsecutivos: number
  }

  /** Faixa de soma das dezenas — pode ser definida por valores absolutos ou percentis. */
  soma:
    | { tipo: 'absoluto'; min: number; max: number }
    | { tipo: 'percentil'; minPercentil: number; maxPercentil: number }

  /** Espalhamento mínimo das dezenas pela grade. */
  espalhamento: {
    /** Quantidade mínima de linhas distintas ocupadas no jogo. */
    minLinhas: number
  }
}

/** Configuração completa de uma loteria (regras, faixa de dezenas e filtros). */
export interface LoteriaConfig {
  /** Identificador único da loteria (ex: 'megasena', 'lotofacil'). */
  id: string

  /** Nome amigável para exibição. */
  nome: string

  /** Quantidade mínima de dezenas que o jogador deve escolher. */
  dezenasMin: number

  /** Quantidade máxima de dezenas que o jogador pode escolher. */
  dezenasMax: number

  /** Menor valor possível de uma dezena. */
  faixaMin: number

  /** Maior valor possível de uma dezena. */
  faixaMax: number

  /** Configuração dos filtros estruturais. */
  filtros: FiltrosConfig

  /** Quantidade de colunas da grade de dezenas (ex: 10 para Mega-Sena). */
  colunas: number

  /** Quantidade de linhas da grade de dezenas. */
  linhas: number
}

/**
 * Valida invariantes de uma configuração de loteria.
 * Garante que os filtros sejam consistentes com as regras do jogo
 * (ex: não é possível exigir mais pares do que dezenas sorteadas).
 * Lança erro em configurações inválidas.
 */
export function validarLoteriaConfig(config: LoteriaConfig): void {
  if (!Number.isInteger(config.dezenasMin) || config.dezenasMin <= 0) {
    throw new Error('dezenasMin deve ser um inteiro positivo')
  }
  if (!Number.isInteger(config.dezenasMax) || config.dezenasMax <= 0) {
    throw new Error('dezenasMax deve ser um inteiro positivo')
  }
  if (config.dezenasMin > config.dezenasMax) {
    throw new Error('dezenasMin não pode ser maior que dezenasMax')
  }

  if (!Number.isInteger(config.faixaMin) || config.faixaMin <= 0) {
    throw new Error('faixaMin deve ser um inteiro positivo')
  }
  if (!Number.isInteger(config.faixaMax) || config.faixaMax <= 0) {
    throw new Error('faixaMax deve ser um inteiro positivo')
  }
  if (config.faixaMin >= config.faixaMax) {
    throw new Error('faixaMin deve ser menor que faixaMax')
  }

  if (!Number.isInteger(config.colunas) || config.colunas <= 0) {
    throw new Error('colunas deve ser um inteiro positivo')
  }
  if (!Number.isInteger(config.linhas) || config.linhas <= 0) {
    throw new Error('linhas deve ser um inteiro positivo')
  }
  if (config.colunas * config.linhas < config.faixaMax) {
    throw new Error('a grade deve ser grande o suficiente para cobrir a faixaMax')
  }

  const { filtros } = config

  if (!Number.isInteger(filtros.parImpar.min) || filtros.parImpar.min < 0) {
    throw new Error('filtros.parImpar.min deve ser um inteiro não negativo')
  }
  if (!Number.isInteger(filtros.parImpar.max) || filtros.parImpar.max < 0) {
    throw new Error('filtros.parImpar.max deve ser um inteiro não negativo')
  }
  if (filtros.parImpar.min > filtros.parImpar.max) {
    throw new Error('filtros.parImpar.min não pode ser maior que filtros.parImpar.max')
  }
  if (filtros.parImpar.max > config.dezenasMax) {
    throw new Error('filtros.parImpar.max não pode ser maior que dezenasMax')
  }

  if (
    !Number.isInteger(filtros.sequenciais.maxConsecutivos) ||
    filtros.sequenciais.maxConsecutivos <= 0
  ) {
    throw new Error('filtros.sequenciais.maxConsecutivos deve ser um inteiro positivo')
  }
  if (filtros.sequenciais.maxConsecutivos >= config.dezenasMax) {
    throw new Error('filtros.sequenciais.maxConsecutivos deve ser menor que dezenasMax')
  }

  if (
    !Number.isInteger(filtros.espalhamento.minLinhas) ||
    filtros.espalhamento.minLinhas <= 0
  ) {
    throw new Error('filtros.espalhamento.minLinhas deve ser um inteiro positivo')
  }
  if (filtros.espalhamento.minLinhas > config.linhas) {
    throw new Error('filtros.espalhamento.minLinhas não pode ser maior que linhas')
  }

  if (filtros.soma.tipo === 'absoluto') {
    if (!Number.isInteger(filtros.soma.min) || filtros.soma.min <= 0) {
      throw new Error('filtros.soma.min absoluto deve ser um inteiro positivo')
    }
    if (!Number.isInteger(filtros.soma.max) || filtros.soma.max <= 0) {
      throw new Error('filtros.soma.max absoluto deve ser um inteiro positivo')
    }
    if (filtros.soma.min > filtros.soma.max) {
      throw new Error('filtros.soma.min não pode ser maior que filtros.soma.max')
    }
  } else if (filtros.soma.tipo === 'percentil') {
    if (
      typeof filtros.soma.minPercentil !== 'number' ||
      filtros.soma.minPercentil < 0 ||
      filtros.soma.minPercentil > 1
    ) {
      throw new Error('filtros.soma.minPercentil deve estar entre 0 e 1')
    }
    if (
      typeof filtros.soma.maxPercentil !== 'number' ||
      filtros.soma.maxPercentil < 0 ||
      filtros.soma.maxPercentil > 1
    ) {
      throw new Error('filtros.soma.maxPercentil deve estar entre 0 e 1')
    }
    if (filtros.soma.minPercentil >= filtros.soma.maxPercentil) {
      throw new Error('filtros.soma.minPercentil deve ser menor que maxPercentil')
    }
  } else {
    throw new Error('filtros.soma.tipo deve ser "absoluto" ou "percentil"')
  }
}
