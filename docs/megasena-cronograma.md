# Cronograma de Execução — Gerenciador de Jogos da Mega-Sena

Plano completo em [`megasena-plano.md`](./megasena-plano.md). Este cronograma divide a implementação em fases sequenciais, pensadas para serem executadas numa próxima janela de contexto.

## Visão geral das fases

| Fase | Nome | Escopo | Saída / Critério de pronto |
|------|------|--------|----------------------------|
| 0 | Scaffold | `npm create vite` (React+TS), `vite.config.ts` com `server.proxy` p/ Caixa, instalar `idb-keyval`, lib de gráfico (ex.: `recharts`), `vitest` | `npm run dev` sobe app vazio sem erro |
| 1 | Camada de dados | `src/data/` (seed de arquivo + parser), `src/api/caixa.ts` (incremental c/ retry/backoff/timeout), cache IndexedDB; `src/types.ts` c/ contrato real da API | Seed popula 1x e persiste; recarregar busca só concursos novos |
| 2 | Estatística | `src/stats/metrics.ts` (funções puras: frequência, atraso, par/ímpar, soma, distribuição) + testes Vitest | `npm test` verde; métricas batem com cálculo manual de amostra |
| 3 | Motor de sugestão | `src/engine/rng.ts` (PRNG c/ seed) + `src/engine/generator.ts`: filtros estruturais + amostragem ponderada + máx-tentativas/relaxamento + validação + testes | Gera N jogos válidos e distintos; determinístico com seed fixa |
| 4 | Dashboard | `src/components/Dashboard.tsx` + `Controls.tsx`: tabelas/gráficos, seletor de janela (50/100/500/tudo) | Métricas recalculam ao trocar janela |
| 5 | Jogos sugeridos | `src/components/SuggestedGames.tsx`: lista de jogos + explicação + aviso de honestidade; controles de pesos e regenerar | 5 jogos com explicação; ajustar pesos regenera |
| 6 | Polimento + verificação | Estados de loading/erro, layout, rodar checklist de Acceptance Criteria | Todos os critérios de aceite atendidos |

**Ordem recomendada:** 0 → 1 → 2 → 3 (núcleo de dados/lógica primeiro, testável sem UI) → 4 → 5 → 6.

## Detalhamento por fase

### Fase 0 — Scaffold
- `npm create vite@latest . -- --template react-ts`
- Instalar: `idb-keyval`, `recharts` (ou similar), `vitest` + `@testing-library/react` (opcional p/ componentes).
- Configurar `vite.config.ts` → `server.proxy['/api/loterias']` apontando para `https://servicebus2.caixa.gov.br/portaldeloterias/api`.
- **Pronto quando:** `npm run dev` abre app em branco sem erros de console.

### Fase 1 — Camada de dados (`src/data/`, `src/api/caixa.ts`, `src/types.ts`)
- **Fixar o contrato real da API antes de codar:** confirmar nomes exatos dos campos (`numero`, `dataApuracao`, `listaDezenas` — strings, `dezenasSorteadasOrdemSorteio`, `numeroConcursoProximo`) → função de **parsing** → `types.ts`.
- Tipos: `Concurso { numero, data, dezenas: number[], ... }`.
- **Carga inicial (seed):** loader/parser de `src/data/` (arquivo de resultados versionado) popula o **IndexedDB** (`idb-keyval`) uma vez, com barra de progresso.
- **Incremental (API):** `fetchUltimo()` para descobrir o último concurso; `fetchConcurso(n)` via proxy `/api/loterias/megasena/{n}` apenas para os concursos novos. Com **retry/backoff exponencial, timeout por request, headers (`User-Agent`/`Accept`) e concorrência conservadora**.
- **Pronto quando:** seed popula tudo e persiste; recarga busca **só os concursos novos** via API.

### Fase 2 — Estatística (`src/stats/metrics.ts`)
- Funções puras sobre `Concurso[]`: `frequencia`, `atraso`, `parImpar`, `somaStats`, `distribuicaoLinhasColunas`.
- Receber janela (N concursos ou tudo) como parâmetro.
- Testes Vitest com fixtures pequenas e valores esperados manuais.
- **Pronto quando:** `npm test` verde.

### Fase 3 — Motor de sugestão (`src/engine/rng.ts`, `src/engine/generator.ts`)
- `src/engine/rng.ts`: PRNG com seed (ex.: mulberry32) **injetável** no generator.
- Filtros estruturais: 2–4 pares, **soma na faixa derivada dos dados** (ex.: percentis 10–90, não hardcoded), evitar 4+ sequenciais, espalhamento.
- Amostragem ponderada por pesos (quentes/atrasadas/aleatório), usando o RNG injetado.
- **Máx-tentativas + relaxamento:** ao estourar o limite de tentativas, relaxar progressivamente o filtro mais restritivo (evita loop infinito).
- `gerarJogos(metricas, config, rng)` → N jogos distintos válidos, cada um com `criterio`/`explicacao`.
- Testes: validade das dezenas, unicidade, filtros respeitados, **determinismo com seed fixa**, comportamento de relaxamento.
- **Pronto quando:** gera N jogos válidos e distintos; determinístico com seed fixa; testes verdes.

### Fase 4 — Dashboard (`src/components/Dashboard.tsx`, `Controls.tsx`)
- Tabelas/gráficos de frequência, atraso, par/ímpar, soma.
- Seletor de janela (50/100/500/tudo) que recalcula métricas.
- **Pronto quando:** trocar a janela atualiza os gráficos.

### Fase 5 — Jogos sugeridos (`src/components/SuggestedGames.tsx`)
- Lista dos N jogos com explicação por jogo + **aviso de honestidade estatística** visível.
- Controles de pesos + quantidade + botão "Regenerar".
- **Pronto quando:** 5 jogos com explicação; ajustar pesos regenera na hora.

### Fase 6 — Polimento + verificação
- Estados de loading/erro (falha de rede, cache vazio), layout responsivo básico.
- Rodar o checklist completo de **Critérios de Aceite** do plano.
- **Pronto quando:** todos os critérios atendidos e `npm test` verde.

## Como retomar na próxima janela
1. Abrir `docs/megasena-plano.md` + este cronograma.
2. Começar pela Fase 0. Cada fase tem critério de "pronto" — só avançar quando atendido.
3. Manter a premissa de honestidade estatística em toda a UI (sem linguagem de "previsão").
