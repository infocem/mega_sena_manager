import { Capacitor } from '@capacitor/core'

export const API_BASE = Capacitor.isNativePlatform()
  ? 'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena'
  : '/api/loterias/megasena'
