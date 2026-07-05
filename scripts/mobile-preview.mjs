import { chromium } from 'playwright'

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 360, height: 740 },
  deviceScaleFactor: 2,
  isMobile: true,
  userAgent: 'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
})

const page = await context.newPage()

// Navega para o app
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 30000 })

// Espera o app carregar (aguarda os jogos aparecerem)
await page.waitForSelector('.jogo', { timeout: 30000 })

// Aguarda um pouco para os gráficos renderizarem
await page.waitForTimeout(2000)

// Tira screenshot
await page.screenshot({ 
  path: 'mobile-preview.png', 
  fullPage: true 
})

console.log('Screenshot salvo em mobile-preview.png')

await browser.close()
