// Verificação no browser real (headless Chromium via Playwright).
// Abre o app, espera carregar (seed → IndexedDB), valida o DOM renderizado,
// captura erros de console e tira um screenshot. NÃO faz parte do app.
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const APP_URL = 'http://localhost:5173/'
const OUT = new URL('../.omc/artifacts/', import.meta.url)

const erros = []
const browser = await chromium.launch()
const page = await browser.newPage()
page.on('console', (m) => {
  if (m.type() === 'error') erros.push(m.text())
})
page.on('pageerror', (e) => erros.push(`pageerror: ${e.message}`))

await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 })

// espera o app sair do estado "carregando" e renderizar os jogos
await page.waitForSelector('li.jogo', { timeout: 30000 })

const h1 = await page.textContent('h1')
const nJogos = await page.locator('li.jogo').count()
const nBolasJogo1 = await page.locator('li.jogo').first().locator('.bola').count()
const temAviso = (await page.locator('.aviso').count()) > 0
const avisoTxt = temAviso ? (await page.locator('.aviso').first().textContent()) ?? '' : ''
const painels = await page.locator('.panel h3').allTextContents()
const barraStatus = (await page.textContent('.barra-status')) ?? ''
const temGraficoSVG = (await page.locator('.panel svg').count()) > 0

// troca a janela e confirma que a barra de status reflete a mudança
await page.getByRole('button', { name: '50', exact: true }).click()
await page.waitForTimeout(300)
const statusApos50 = (await page.textContent('.barra-status')) ?? ''

// regenerar muda os jogos
const antes = await page.locator('li.jogo').allTextContents()
await page.getByRole('button', { name: /regenerar/i }).click()
await page.waitForTimeout(300)
const depois = await page.locator('li.jogo').allTextContents()
const regenerouMudou = JSON.stringify(antes) !== JSON.stringify(depois)

await mkdir(OUT, { recursive: true })
await page.screenshot({ path: new URL('app.png', OUT).pathname, fullPage: true })

await browser.close()

const relatorio = {
  h1,
  nJogos,
  nBolasJogo1,
  temAviso,
  avisoMencionaHonestidade: /honestidade/i.test(avisoTxt) && /Nenhuma análise aumenta/i.test(avisoTxt),
  painels,
  temGraficoSVG,
  barraStatusInicial: barraStatus.replace(/\s+/g, ' ').trim().slice(0, 120),
  janela50Refletida: /50 concursos/.test(statusApos50),
  regenerouMudou,
  errosConsole: erros,
}
console.log(JSON.stringify(relatorio, null, 2))

const ok =
  nJogos === 5 &&
  nBolasJogo1 === 6 &&
  relatorio.avisoMencionaHonestidade &&
  temGraficoSVG &&
  relatorio.janela50Refletida &&
  regenerouMudou &&
  erros.length === 0
console.log(ok ? '\nVERIFY_OK' : '\nVERIFY_FALHOU')
process.exit(ok ? 0 : 1)
