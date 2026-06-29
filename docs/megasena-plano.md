# Plano: Gerenciador de Jogos da Mega-Sena

## Contexto
Sistema que, a partir dos resultados históricos da Mega-Sena, **sugere jogos** (ex.: 5 jogos) usando heurísticas estatísticas, junto de um **dashboard de estatísticas** explorável.

> **Premissa central (honestidade estatística):** a Mega-Sena é um sorteio aleatório de variáveis independentes. **Nenhuma análise aumenta a probabilidade real de acerto** (~1 em 50,06 milhões por jogo de 6 dezenas). O produto entrega *estratégia de seleção/diversificação transparente*, **não previsão**. Cada sugestão explica o critério usado e exibe esse aviso.

Projeto **greenfield** (`ms_manager/` vazio).

## Metadata
- Tipo: greenfield
- Ambiguidade final do interview: ~17% (threshold 20% — PASSED)

## Topologia (componentes)
| Componente | Status | Descrição |
|-----------|--------|-----------|
| Coleta de Dados | ativo | **Seed por arquivo** na carga inicial + **API oficial da Caixa** só no incremental + cache local (IndexedDB) |
| Análise Estatística | ativo | Frequência, atraso, par/ímpar, soma, distribuição |
| Motor de Sugestão | ativo | Gerar N jogos com filtros + pesos configuráveis |
| Interface/Dashboard | ativo | Web local (Vite + React): dashboard + gerador interativo |

## Objetivo
App web local (Vite + React) que carrega o histórico da Mega-Sena da API oficial da Caixa, calcula métricas estatísticas, exibe um **dashboard explorável** e gera **N jogos sugeridos (padrão 5)** — cada um com a explicação do critério e o aviso de que não altera a probabilidade real. O usuário pode **ajustar critérios/pesos e regenerar** na hora.

## Restrições / Decisões
- Stack: **Vite + React + TypeScript**.
- Fonte: **API oficial da Caixa** (`https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena`).
- **CORS:** a API da Caixa bloqueia chamadas direto do navegador → usar **proxy de dev do Vite** (`server.proxy` em `vite.config.ts`) apontando `/api/loterias` → host da Caixa.
- **Sem endpoint de histórico em massa:** a API só retorna por concurso. Estratégia:
  - **Carga inicial (seed):** importar o histórico completo de um **arquivo** versionado no repo em `src/data/` (resultados oficiais da Caixa em HTML/zip, ou dataset comunitário), parsear uma vez e gravar em **IndexedDB** (via `idb-keyval`). Evita ~2.900 requisições e risco de ban de IP no 1º uso.
  - **Incremental:** após o seed, usar a **API oficial** apenas para buscar os concursos **novos** desde o último cacheado.
  - **Robustez da API (incremental):** retry com backoff exponencial, timeout por request, headers necessários (`User-Agent`, `Accept`) e concorrência conservadora.
- Janela de análise: **histórico completo (padrão)** + **seletor de janela recente** (50 / 100 / 500 / tudo).
- **Proxy só em `dev`:** `server.proxy` do Vite só funciona em `npm run dev`. `npm run build`/preview **não** terá proxy (fora de escopo agora — limitação conhecida).
- Mobile: **fase futura** (fora de escopo agora).

## Non-Goals (fase atual)
- Conferência/rastreio de apostas feitas ("quantos acertei").
- App mobile / empacotamento desktop.
- Qualquer alegação de "previsão" ou aumento de probabilidade real.

## Critérios de Aceite
- [ ] `npm run dev` sobe o app; na primeira carga popula o histórico **via seed de arquivo** (com indicador de progresso) e cacheia em IndexedDB; recargas buscam **só os concursos novos** via API.
- [ ] Dashboard mostra: **frequência por dezena**, **atraso (concursos desde a última saída)**, distribuição **par/ímpar**, faixa de **soma**, com tabelas/gráficos.
- [ ] Seletor de janela (50/100/500/tudo) recalcula as métricas dinamicamente.
- [ ] Botão "Gerar jogos" produz **5 jogos** (quantidade configurável) válidos (6 dezenas, 1–60, sem repetição) respeitando os **filtros estruturais**.
- [ ] Cada jogo exibe **o critério/explicação** + **aviso de honestidade estatística**.
- [ ] Controles de **pesos** (quentes vs. atrasadas vs. aleatório) ajustam e **regeneram** os jogos na hora.
- [ ] Geração é **determinística com seed fixa** (coberto por teste do `engine/`).
- [ ] Generator respeita **máx-tentativas** e **relaxa filtros** sem travar quando candidatos válidos são raros (coberto por teste).

## Motor de Sugestão (design)
- **Filtros estruturais** (todo jogo gerado deve passar): 2–4 pares, **soma na faixa derivada dos dados** (ex.: percentis 10–90 das somas históricas — não hardcoded), evitar 4+ sequenciais, espalhamento por linhas/colunas do volante.
- **Pesos de seleção** (ajustáveis): mistura de dezenas **quentes** (mais frequentes) + **atrasadas** + um modo **aleatório puro** como baseline de comparação.
- **PRNG com seed:** a amostragem ponderada usa um RNG **injetável com seed** (ex.: mulberry32 em `src/engine/rng.ts`) → geração reproduzível e testável.
- **Máx-tentativas + fallback:** limite de tentativas por jogo; ao estourar, relaxar progressivamente o **filtro mais restritivo** (evita loop infinito por sobre-restrição quando candidatos válidos são raros).
- Geração: amostragem ponderada das dezenas → montar candidato → validar filtros → repetir até obter N jogos distintos (ou relaxar filtros ao atingir o máx-tentativas).

## Estrutura de Arquivos (a criar)
- `package.json`, `vite.config.ts` (com `server.proxy`), `tsconfig.json`, `index.html`
- `src/main.tsx`, `src/App.tsx`
- `src/data/` — arquivo **seed** do histórico (versionado) + loader/parser para popular o IndexedDB na 1ª carga
- `src/api/caixa.ts` — fetch por concurso (incremental), retry/backoff/timeout, cache IndexedDB, atualização incremental
- `src/stats/metrics.ts` — frequência, atraso, par/ímpar, soma, distribuição (funções puras, testáveis)
- `src/engine/rng.ts` — PRNG com seed (ex.: mulberry32) injetável no generator
- `src/engine/generator.ts` — filtros estruturais + amostragem ponderada (RNG injetável) + validação + máx-tentativas/relaxamento
- `src/components/Dashboard.tsx` — tabelas/gráficos das métricas + seletor de janela
- `src/components/SuggestedGames.tsx` — lista dos N jogos + explicações + aviso
- `src/components/Controls.tsx` — pesos, quantidade de jogos, janela, botão regenerar
- `src/types.ts` — tipos do domínio (Concurso, Metricas, Jogo)
- Testes unitários para `stats/` e `engine/` (Vitest)

## Ontologia (entidades-chave)
| Entidade | Tipo | Campos | Relações |
|----------|------|--------|----------|
| Concurso | core | numero, data, dezenas[6], premiacao? | base das Métricas |
| Métricas | core | frequencia, atraso, parImpar, soma, distribuicao | derivadas dos Concursos |
| Jogo | core | dezenas[6], criterio, explicacao | gerado pelo Motor a partir das Métricas |
| Pesos/Config | suporte | pesoQuentes, pesoAtrasadas, qtdJogos, janela | parametriza o Motor |

## Verificação (end-to-end)
1. `npm install && npm run dev`; abrir `http://localhost:5173`.
2. Confirmar carga inicial **via seed de arquivo** (indicador de progresso) e persistência em IndexedDB; recarregar busca só concursos novos via API (incremental).
3. Conferir métricas no dashboard contra um cálculo manual de amostra pequena.
4. Trocar a janela e verificar recálculo.
5. Gerar jogos: validar 6 dezenas únicas 1–60, filtros estruturais respeitados, explicação + aviso presentes.
6. Ajustar pesos → regenerar → resultados mudam coerentemente.
7. `npm test` (Vitest) verde para `stats/` e `engine/`.

## Decisões registradas no interview
- R1 Interface: web local Vite+React (mobile depois).
- R2 Fonte: API oficial da Caixa.
- R3 Heurística: delegada → filtros estruturais + pesos configuráveis transparentes.
- R4 Sucesso: 5 jogos+explicação, dashboard, ajustar/regenerar (conferência de apostas = fora de escopo).
- R5 Janela: histórico completo + seletor de janela recente.
- R6 (refinamento pós-interview) Fonte: **seed por arquivo** na carga inicial + API oficial **só no incremental** (com retry/backoff/timeout). Evita ~2.900 requisições e risco de ban.
- R7 (refinamento pós-interview) Gerador: **PRNG com seed** (determinístico/testável) + **faixa de soma derivada dos dados** + **máx-tentativas com relaxamento de filtros**.
