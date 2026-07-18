// Configuração da Lotofácil.
// Regras: aposta com 15 a 20 dezenas, sorteio de 15 dezenas entre 1 e 25.
import { validarLoteriaConfig, type LoteriaConfig } from './loterias'

export const lotofacilConfig: LoteriaConfig = {
  id: 'lotofacil',
  nome: 'Lotofácil',
  dezenasMin: 15,
  dezenasMax: 20,
  faixaMin: 1,
  faixaMax: 25,
  colunas: 5,
  linhas: 5,
  filtros: {
    parImpar: { min: 6, max: 10 },
    sequenciais: { maxConsecutivos: 4 },
    soma: { tipo: 'absoluto', min: 150, max: 300 },
    espalhamento: { minLinhas: 4 },
  },
}

validarLoteriaConfig(lotofacilConfig)
