import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('API_BASE', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns absolute URL when running on native platform', async () => {
    vi.doMock('@capacitor/core', () => ({
      Capacitor: {
        isNativePlatform: () => true,
      },
    }))

    const { API_BASE } = await import('./base')
    expect(API_BASE).toBe('https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena')
  })

  it('returns relative path when running on web', async () => {
    vi.doMock('@capacitor/core', () => ({
      Capacitor: {
        isNativePlatform: () => false,
      },
    }))

    const { API_BASE } = await import('./base')
    expect(API_BASE).toBe('/api/loterias/megasena')
  })
})
