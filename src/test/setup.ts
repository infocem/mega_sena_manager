// Polyfills para os testes de componentes em jsdom.
// recharts (ResponsiveContainer) usa ResizeObserver, ausente no jsdom.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!('ResizeObserver' in globalThis)) {
  ;(globalThis as unknown as { ResizeObserver: typeof ResizeObserverMock }).ResizeObserver =
    ResizeObserverMock
}
