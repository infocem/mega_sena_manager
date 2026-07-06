# docs-readme-update - Work Plan

## TL;DR (For humans)
<!-- Fill this LAST, after the detailed plan below is written, so it summarizes the REAL plan. -->
<!-- Plain English for a non-engineer: NO file paths, NO todo numbers, NO wave/agent/tool names. -->

**What you'll get:** Um guia completo do usuário em `docs/GUIA-USUARIO.md` explicando todos os conceitos do app (o que são atrasadas, frequência, filtros, etc.) + README atualizado com lista de funcionalidades, scripts Android e link para o guia.

**Why this approach:** O README atual é bom para devs mas invisível para usuários. O guia separa a documentação funcional (glossário → dashboard → gerador → filtros → FAQ) em linguagem acessível, enquanto o README ganha contexto sobre o que o app faz e como buildar para Android.

**What it will NOT do:** Não cria site de documentação, não adiciona screenshots, não traduz para inglês, não modifica código-fonte.

**Effort:** Quick
**Risk:** Low - documentação apenas, sem risco de quebrar nada funcional
**Decisions to sanity-check:** Glossário com 15+ termos (incluindo "seed do gerador" e "seed de dados" separados); FAQ com 5 perguntas pré-definidas; espalhamento definido como grupos de 10 (não linhas de 6); 2 commits separados (README e guia).

Your next move: aprovar e iniciar execução com `/start-work`. Full execution detail follows below.

---

> TL;DR (machine): Quick, Low risk — README incrementado + docs/GUIA-USUARIO.md criado com glossário, dashboard, gerador, filtros, FAQ e aviso de honestidade

## Scope
### Must have
- README.md: seção "Funcionalidades" listando dashboard estatístico e gerador de jogos
- README.md: scripts Capacitor/Android na seção de comandos
- README.md: link para `docs/GUIA-USUARIO.md`
- docs/GUIA-USUARIO.md: glossário completo de termos do domínio
- docs/GUIA-USUARIO.md: explicação de cada painel do dashboard
- docs/GUIA-USUARIO.md: explicação do gerador (pesos, controles, filtros)
- docs/GUIA-USUARIO.md: aviso de honestidade estatística
- docs/GUIA-USUARIO.md: FAQ com perguntas comuns

### Must NOT have (guardrails, anti-slop, scope boundaries)
- Não reestruturar seções existentes do README (apenas adicionar novas)
- Não criar site de documentação (Docusaurus, VitePress, etc.)
- Não adicionar screenshots (não disponíveis ainda)
- Não traduzir para inglês
- Não modificar código-fonte
- Não criar múltiplos arquivos de documentação (apenas um guia)

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: **none** (documentação apenas — sem código para testar)
- QA: verificar renderização markdown válida (sem links quebrados, headers corretos)
- Evidence: `.omo/evidence/task-N-docs-readme-update.md`

## Execution strategy
### Parallel execution waves
> Target 5-8 todos per wave. Fewer than 3 (except the final) means you under-split.

**Wave 1** (paralelo): Todos 1-3 — criar diretório docs/, escrever glossário, escrever seção dashboard
**Wave 2** (paralelo): Todos 4-6 — escrever seção gerador, escrever seção filtros, escrever FAQ
**Wave 3** (paralelo): Todos 7-8 — incrementar README.md, revisão final de links e consistência

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. Criar docs/ | — | 2,3,4,5,6 | — |
| 2. Escrever glossário | 1 | 7 | 3,4,5,6 |
| 3. Escrever seção dashboard | 1 | 7 | 2,4,5,6 |
| 4. Escrever seção gerador | 1 | 7 | 2,3,5,6 |
| 5. Escrever seção filtros | 1 | 7 | 2,3,4,6 |
| 6. Escrever FAQ + aviso | 1 | 7 | 2,3,4,5 |
| 7. Incrementar README.md | 2,3,4,5,6 | 8 | — |
| 8. Revisão final de links | 7 | — | — |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->

- [x] 1. Criar diretório docs/ e arquivo GUIA-USUARIO.md com cabeçalho
  **What to do:** Criar `docs/GUIA-USUARIO.md` com título `# Guia do Usuário — Mega-Sena Manager` e introdução breve (2-3 linhas explicando o propósito do guia). Incluir aviso de honestidade estatística logo após a introdução.
  **Must NOT do:** Não adicionar conteúdo de outras seções ainda (glossário, dashboard, etc. virão nos próximos todos).
  Parallelization: Wave 1 | Blocked by: — | Blocks: 2,3,4,5,6
  References: `SuggestedGames.tsx:41-46` (aviso de honestidade), `App.tsx:22-26` (descrição do app)
  Acceptance criteria: arquivo `docs/GUIA-USUARIO.md` existe com título e introdução
  QA scenarios:
  - happy: `cat docs/GUIA-USUARIO.md | head -10` mostra título e introdução
  - failure: arquivo não existe → criar novamente
  Evidence: `.omo/evidence/task-1-docs-readme-update.md`
  Commit: N

- [x] 2. Escrever seção Glossário no GUIA-USUARIO.md
  **What to do:** Adicionar seção `## Glossário` com definições claras e em linguagem acessível para os seguintes termos (≥15): **dezena** (número de 1 a 60), **concurso** (sorteio realizado), **volante** (cartela física de aposta, 10 linhas × 6 colunas), **frequência** (quantas vezes uma dezena saiu), **atraso/atrasadas** (concursos sem sair), **janela de análise** (período de análise: 50, 100, 500 ou todos os concursos), **quentes** (dezenas frequentes), **soma** (total das 6 dezenas), **par/ímpar** (distribuição), **espalhamento** (distribuição pelas colunas do volante — grupos de 10: 01-10, 11-20, ..., 51-60), **filtros estruturais** (regras de diversificação do gerador), **seed do gerador** (número que controla o PRNG — mesma seed = mesmos jogos), **seed de dados** (arquivo JSON com histórico de concursos), **relaxamento** (quando filtros são afrouxados progressivamente), **critério** (rótulo de cada jogo: Quentes/Atrasadas/Aleatório/Misto). Cada termo com 1-3 frases.
  **Must NOT do:** Não usar jargão técnico sem explicar. Não incluir fórmulas matemáticas. Não confundir os dois tipos de "seed" — são entradas separadas no glossário.
  Parallelization: Wave 1 | Blocked by: 1 | Blocks: 7
  References: `src/types.ts:6-12` (Concurso), `src/types.ts:38-48` (FrequenciaItem, AtrasoItem), `src/types.ts:86-90` (Pesos), `src/types.ts:36` (Janela), `src/stats/metrics.ts:38-45` (frequencia), `src/stats/metrics.ts:52-65` (atraso), `src/engine/generator.ts:59-90` (filtros), `src/engine/generator.ts:11` (COLUNAS=10 no gerador), `src/engine/rng.ts:7-16` (mulberry32), `src/data/megasena-seed.json` (seed de dados)
  Acceptance criteria: seção `## Glossário` presente com ≥15 termos definidos; "seed do gerador" e "seed de dados" são entradas separadas; "espalhamento" menciona grupos de 10 (colunas do volante)
  QA scenarios:
  - happy: `grep -c "^### " docs/GUIA-USUARIO.md` retorna ≥15 (subseções do glossário); `grep "seed do gerador" docs/GUIA-USUARIO.md` e `grep "seed de dados" docs/GUIA-USUARIO.md` ambos encontram
  - failure: menos de 15 termos → adicionar os faltantes; seeds não separados → corrigir
  Evidence: `.omo/evidence/task-2-docs-readme-update.md`
  Commit: N

- [x] 3. Escrever seção Dashboard no GUIA-USUARIO.md
  **What to do:** Adicionar seção `## Dashboard Estatístico` explicando: (a) **Seletor de janela** — botões 50/100/500/Tudo que controlam quantos concursos recentes são usados para calcular todas as estatísticas; (b) **Frequência por dezena** — gráfico de barras mostrando quantas vezes cada dezena (1-60) saiu na janela selecionada; (c) **Distribuição par/ímpar** — quantos concursos tiveram 0P/6Í, 1P/5Í, ..., 6P/0Í, com destaque visual para 3P/3Í (equilíbrio); (d) **Maiores atrasos** — tabela com as 12 dezenas que mais tempo ficaram sem sair (não todas as 60); (e) **Soma das dezenas** — 6 estatísticas (mín, p10, média, mediana, p90, máx) da soma das 6 dezenas, com destaque para a faixa típica (p10-p90). Mencionar que a faixa p10-p90 da soma é usada como filtro do gerador (conexão dashboard → gerador).
  **Must NOT do:** Não sugerir que frequência alta = "dezena quente vai sair". Manter tom descritivo.
  Parallelization: Wave 1 | Blocked by: 1 | Blocks: 7
  References: `src/components/Dashboard.tsx:38-128` (4 painéis), `src/components/Dashboard.tsx:73` (destaque 3P/3Í), `src/components/Dashboard.tsx:125-127` (faixa típica usada como filtro), `src/components/Controls.tsx:5-10` (opções de janela), `src/stats/metrics.ts:78-92` (somaStats), `src/stats/metrics.ts:68-76` (parImpar)
  Acceptance criteria: seção `## Dashboard Estatístico` com 5 subseções (seletor de janela + 4 painéis); menção da conexão com o gerador na seção de soma
  QA scenarios:
  - happy: `grep "## Dashboard" docs/GUIA-USUARIO.md` encontra a seção; `grep "janela" docs/GUIA-USUARIO.md` na seção dashboard encontra explicação do seletor; `grep "filtro do gerador" docs/GUIA-USUARIO.md` encontra
  - failure: painel ou seletor faltando → adicionar
  Evidence: `.omo/evidence/task-3-docs-readme-update.md`
  Commit: N

- [x] 4. Escrever seção Gerador de Jogos no GUIA-USUARIO.md
  **What to do:** Adicionar seção `## Gerador de Jogos` explicando: (a) **Pesos** — 3 sliders (Quentes, Atrasadas, Aleatório) de 0 a 100 que controlam a probabilidade relativa de cada dezena ser selecionada. **Valores iniciais: Quentes 40, Atrasadas 40, Aleatório 20** (não são iguais — há leve prioridade para quentes e atrasadas). Quentes = prioriza dezenas frequentes; Atrasadas = prioriza dezenas com maior atraso; Aleatório = distribuição uniforme. (b) **Quantidade** — de 1 a 20 jogos por geração (padrão: 5). (c) **Regenerar** — botão que muda a semente do PRNG e gera novos jogos mantendo os mesmos pesos. (d) **Formato de cada jogo** — 6 bolas numeradas + rótulo do critério dominante (Quentes/Atrasadas/Aleatório/Misto) + texto explicativo completo. (e) **Aviso de honestidade** — reforçar que nenhuma estratégia aumenta a chance real (~1 em 50 milhões).
  **Must NOT do:** Não usar termos como "previsão" ou "probabilidade de acerto". Não omitir o aviso de honestidade. Não documentar a fórmula matemática de normalização dos pesos.
  Parallelization: Wave 2 | Blocked by: 1 | Blocks: 7
  References: `src/components/SuggestedGames.tsx:13` (PESOS_INICIAIS = { quentes: 40, atrasadas: 40, aleatorio: 20 }), `src/components/SuggestedGames.tsx:17` (qtd padrão = 5), `src/components/SuggestedGames.tsx:48-99` (controles), `src/components/SuggestedGames.tsx:107-121` (renderização dos jogos com bolas + critério + explicação), `src/engine/generator.ts:92-117` (pesosPorDezena), `src/engine/generator.ts:132-143` (descreverCriterio)
  Acceptance criteria: seção `## Gerador de Jogos` com explicação dos 3 pesos incluindo valores iniciais (40/40/20), controles, formato de saída dos jogos, e aviso de honestidade
  QA scenarios:
  - happy: `grep "## Gerador" docs/GUIA-USUARIO.md` encontra; `grep "40" docs/GUIA-USUARIO.md` na seção gerador encontra os defaults; `grep "honestidade" docs/GUIA-USUARIO.md` encontra menção
  - failure: defaults não mencionados → adicionar; seção incompleta → completar
  Evidence: `.omo/evidence/task-4-docs-readme-update.md`
  Commit: N

- [x] 5. Escrever seção Filtros Estruturais no GUIA-USUARIO.md
  **What to do:** Adicionar seção `## Filtros Estruturais` explicando as 4 regras que todo jogo gerado deve passar: (a) **Par/Ímpar** — entre 2 e 4 dezenas pares (evita jogos extremos como 6 pares ou 6 ímpares); (b) **Soma na faixa** — soma das 6 dezenas entre os percentis 10 e 90 do histórico (faixa típica derivada dos dados, não hardcoded); (c) **Sem sequenciais longos** — no máximo 3 dezenas consecutivas (rejeita 4+ em sequência); (d) **Espalhamento** — dezenas distribuídas em pelo menos 3 grupos distintos do volante, onde cada grupo é uma faixa de 10 números (01-10, 11-20, 21-30, 31-40, 41-50, 51-60). Explicar o **relaxamento progressivo** como subseção: se o gerador não encontra candidatos válidos após 200 tentativas por nível, ele relaxa os filtros na ordem espalhamento → soma → sequenciais → par/ímpar, até conseguir gerar o jogo. Mencionar que quando isso ocorre, o jogo exibe a mensagem "alguns filtros foram relaxados por escassez de candidatos válidos".
  **Must NOT do:** Não apresentar filtros como "otimização" ou "estratégia vencedora". São regras de diversificação. Não documentar a fórmula de pesos ou o `1e-9` floor.
  Parallelization: Wave 2 | Blocked by: 1 | Blocks: 7
  References: `src/engine/generator.ts:21-26` (FILTRO_POR_NIVEL — ordem de relaxamento), `src/engine/generator.ts:11` (COLUNAS=10 no gerador — grupos de 10), `src/engine/generator.ts:53-56` (linhasDistintas — usa Math.floor((d-1)/10)), `src/engine/generator.ts:59-90` (validarCandidato — todos os thresholds), `src/engine/generator.ts:75-78` (parImpar: 2-4 pares), `src/engine/generator.ts:79-81` (sequenciais: rejeita ≥4), `src/engine/generator.ts:82-85` (soma: faixa min-max), `src/engine/generator.ts:86-88` (espalhamento: ≥3 linhas), `src/engine/generator.ts:170-188` (loop com relaxamento, MAX_TENTATIVAS=200), `src/engine/generator.ts:194-196` (mensagem de relaxamento), `src/engine/generator.ts:34-36` (faixaSomaDosDados — p10/p90)
  Acceptance criteria: seção `## Filtros Estruturais` com 4 filtros + subseção de relaxamento; espalhamento definido como grupos de 10 (não linhas de 6); thresholds exatos: 2-4 pares, ≥4 sequenciais rejeitados, ≥3 grupos distintos
  QA scenarios:
  - happy: `grep "## Filtros" docs/GUIA-USUARIO.md` encontra; `grep "relaxamento" docs/GUIA-USUARIO.md` encontra; `grep "01-10" docs/GUIA-USUARIO.md` ou `grep "grupos de 10" docs/GUIA-USUARIO.md` encontra definição de espalhamento
  - failure: filtro ou relaxamento faltando → adicionar; espalhamento definido como "linhas de 6" → corrigir para "grupos de 10"
  Evidence: `.omo/evidence/task-5-docs-readme-update.md`
  Commit: N

- [x] 6. Escrever seção FAQ + Aviso final no GUIA-USUARIO.md
  **What to do:** Adicionar seção `## Perguntas Frequentes` com ≥5 perguntas e respostas: (1) "As estatísticas aumentam minha chance de ganhar?" → Não, a Mega-Sena é aleatória, ~1 em 50 milhões por jogo. (2) "O que são dezenas atrasadas?" → Dezenas que não saíram há muitos concursos. (3) "O que significa o critério 'Misto'?" → Os pesos estão equilibrados, sem dominância de quentes/atrasadas/aleatório. (4) "Por que alguns jogos dizem que filtros foram relaxados?" → O gerador não encontrou candidatos válidos com todos os filtros e precisou afrouxar alguns. (5) "O que é a janela de análise?" → O número de concursos recentes usados para calcular as estatísticas. Adicionar seção `## Aviso Legal` final reiterando que o app é uma ferramenta de análise estatística descritiva e diversificação, não de previsão.
  **Must NOT do:** Não inventar perguntas irrelevantes. Manter FAQ focado no uso real do app.
  Parallelization: Wave 2 | Blocked by: 1 | Blocks: 7
  References: `src/components/SuggestedGames.tsx:41-46` (aviso honestidade), `src/types.ts:36` (Janela), `src/engine/generator.ts:132-143` (critério Misto), `src/engine/generator.ts:194-196` (mensagem relaxamento)
  Acceptance criteria: seção `## Perguntas Frequentes` com ≥5 Q&As + seção `## Aviso Legal`
  QA scenarios:
  - happy: `grep -c "^### " docs/GUIA-USUARIO.md` na seção FAQ ≥5; `grep "## Aviso" docs/GUIA-USUARIO.md` encontra
  - failure: menos de 5 perguntas → adicionar mais
  Evidence: `.omo/evidence/task-6-docs-readme-update.md`
  Commit: N

- [x] 7. Incrementar README.md com novas seções
  **What to do:** Adicionar ao README.md (APÓS a seção "## Stack" e ANTES de "## Desenvolvimento"): (a) seção `## Funcionalidades` listando: Dashboard estatístico com 4 painéis (frequência, par/ímpar, maiores atrasos, soma); Gerador de jogos com pesos ajustáveis e critérios transparentes; Atualização automática do histórico via API da Caixa; Cache local com IndexedDB; Suporte a app Android via Capacitor. Adicionar APÓS a seção "## Desenvolvimento": (b) subseção `### App Android (Capacitor)` com os 4 scripts (`npm run cap:sync` — build + sync para Android, `npm run cap:open` — abre no Android Studio, `npm run cap:build:debug` — gera APK debug, `npm run cap:build:release` — gera APK release), menção breve aos pré-requisitos (Android SDK + JDK), e link para a [documentação oficial do Capacitor](https://capacitorjs.com/docs). Adicionar link `📖 [Guia do Usuário](docs/GUIA-USUARIO.md)` no topo do README (após a descrição inicial).
  **Must NOT do:** Não remover ou reordenar seções existentes. Não alterar texto existente. Não documentar assinatura de APK, Play Store ou keystore.
  Parallelization: Wave 3 | Blocked by: 2,3,4,5,6 | Blocks: 8
  References: `README.md:1-83` (estrutura atual), `package.json:13-16` (scripts Capacitor), `capacitor.config.ts:1-17` (config Android — appId: com.infocem.megasena)
  Acceptance criteria: README.md contém seção "## Funcionalidades", subseção "### App Android (Capacitor)" com 4 scripts + pré-requisitos + link docs, e link para GUIA-USUARIO.md
  QA scenarios:
  - happy: `grep "## Funcionalidades" README.md` encontra; `grep "cap:sync" README.md` encontra; `grep "GUIA-USUARIO" README.md` encontra; `grep "Android SDK" README.md` encontra
  - failure: seção faltando → adicionar
  Evidence: `.omo/evidence/task-7-docs-readme-update.md`
  Commit: Y | `docs(readme): adiciona funcionalidades, scripts Capacitor e link para guia do usuário`

- [x] 8. Revisão final de links e consistência do GUIA-USUARIO.md
  **What to do:** Revisar o GUIA-USUARIO.md completo: (a) verificar que todos os headers estão em ordem lógica (Glossário → Dashboard → Gerador → Filtros → FAQ → Aviso); (b) verificar que não há links quebrados; (c) verificar consistência de terminologia (mesmos termos em todo o documento); (d) verificar que o aviso de honestidade aparece em pelo menos 2 lugares (introdução + seção gerador ou FAQ); (e) adicionar `## Sumário` com links internos para cada seção no topo do guia.
  **Must NOT do:** Não alterar o conteúdo substantivo — apenas consistência e formatação.
  Parallelization: Wave 3 | Blocked by: 7 | Blocks: —
  References: `docs/GUIA-USUARIO.md` (arquivo completo)
  Acceptance criteria: sumário com links para todas as seções; zero links quebrados; terminologia consistente
  QA scenarios:
  - happy: `grep "## Sumário" docs/GUIA-USUARIO.md` encontra; todas as seções linkadas no sumário existem no documento
  - failure: link quebrado ou seção faltando → corrigir
  Evidence: `.omo/evidence/task-8-docs-readme-update.md`
  Commit: Y | `docs: cria guia do usuário com glossário, dashboard, gerador e FAQ`

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [x] F1. Plan compliance audit — verificar que README.md tem as 3 adições (funcionalidades, Capacitor, link) e GUIA-USUARIO.md tem todas as seções (glossário, dashboard, gerador, filtros, FAQ, aviso)
- [x] F2. Code quality review — verificar markdown válido, sem headers duplicados, sem typos em PT-BR
- [x] F3. Real manual QA — renderizar ambos os arquivos markdown e verificar que links internos funcionam e sumário está correto
- [x] F4. Scope fidelity — confirmar que nenhuma seção existente do README foi removida ou reordenada; confirmar que nenhum código-fonte foi alterado

## Commit strategy
2 commits atômicos:
1. `docs(readme): adiciona funcionalidades, scripts Capacitor e link para guia do usuário` — após Todo 7
2. `docs: cria guia do usuário com glossário, dashboard, gerador e FAQ` — após Todo 8 (guia completo + revisão)

## Success criteria
- `docs/GUIA-USUARIO.md` existe com ≥6 seções principais (Glossário, Dashboard, Gerador, Filtros, FAQ, Aviso Legal)
- `README.md` contém seção "Funcionalidades", subseção "App Android (Capacitor)" e link para o guia
- Todos os termos do domínio (≥12) estão definidos no glossário
- Aviso de honestidade estatística aparece em ≥2 locais
- Zero seções existentes do README foram removidas
- `npm run typecheck` continua passando (nenhum código alterado)
