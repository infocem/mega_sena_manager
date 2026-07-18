# Learnings - LotoHub Plan

## Initial Codebase Analysis

### Current Architecture
- **Project name**: "ms-manager" (Mega-Sena Manager)
- **Stack**: Vite + React 18 + TypeScript + IndexedDB + Recharts
- **Language**: Portuguese (Brazilian) throughout
- **Module system**: ESM

### Hardcoded Values to Extract
From `src/engine/generator.ts`:
- `TOTAL_DEZENAS = 60` (line 11)
- `COLUNAS = 10` (line 12)
- `MAX_TENTATIVAS_POR_NIVEL = 200` (line 13)
- Filter order: espalhamento → soma → sequenciais → parImpar (lines 21-26)
- Validation: 6 dezenas, 2-4 pares, soma faixa, <4 sequenciais, 3+ linhas (lines 58-90)

From `src/stats/metrics.ts`:
- `TOTAL_DEZENAS = 60` (line 14)
- `LINHAS = 10, COLUNAS = 6` (lines 16-17)

From `src/data/parser.ts`:
- Validation: 6 dezenas únicas, 1-60 (lines 6-12)

From `src/data/cache.ts`:
- `CHAVE = 'megasena:concursos:v1'` (line 9)

### Key Files
- `src/types.ts`: Domain types (Concurso, Metricas, Jogo, etc.)
- `src/engine/generator.ts`: Game generation with filters
- `src/stats/metrics.ts`: Statistical calculations
- `src/data/parser.ts`: Data validation/parsing
- `src/data/cache.ts`: IndexedDB cache
- `src/data/seed.ts`: Seed loader
- `src/components/`: Dashboard, Controls, SuggestedGames

### Test Files
- 7 test files found (api, stats, data, engine)
- All use Vitest + Testing Library
- DI pattern for testability (injectable deps)

## Wave 0 — Rename to LotoHub (2026-07-18)

### Changes Made
- `package.json`: `"name"` changed from `"ms-manager"` to `"loto-hub"`
- `README.md`: title changed from `# Mega-Sena Manager` to `# LotoHub`; first paragraph updated to mention "Hub multi-loterias com suporte a Mega-Sena e Lotofácil"
- `AGENTS.md`: no changes needed — file contained no references to `mega_sena_manager` or `ms-manager`

### Verified
- `npm run typecheck` passes clean

## Wave 1 — Lotofácil config

### Config shape
- `src/config/loterias.ts` já existia com a interface `LoteriaConfig` (Task 2).
- Filtros usam `FiltrosConfig`:
  - `parImpar: { min, max }`
  - `sequenciais: { maxConsecutivos }`
  - `soma: { tipo: 'absoluto' | 'percentil', ... }`
  - `espalhamento: { minLinhas }`

### Lotofácil rules applied
- `dezenasMin: 15`, `dezenasMax: 20`
- `faixaMin: 1`, `faixaMax: 25`
- Grade: `linhas: 5`, `colunas: 5`
- Filtros escolhidos:
  - Pares: 6–10 (intervalo razoável para 15–20 dezenas)
  - Sequênciais: no máximo 4 consecutivos
  - Soma: 150–300 (cobre 15 e 20 dezenas)
  - Espalhamento: pelo menos 4 linhas distintas

### File created
- `src/config/lotofacil.ts` exportando `lotofacilConfig`

### Verified
- `npm run typecheck` passes

## Task 2 — Tipos de configuração de loteria (2026-07-18)

### Criado
- `src/config/loterias.ts` com as interfaces `LoteriaConfig` e `FiltrosConfig`

### Valores mapeados para a interface
- `id` / `nome`: identificadores da loteria
- `dezenasMin` / `dezenasMax`: quantidade de dezenas do jogo (ex: 6 para Mega-Sena, 15–20 para Lotofácil)
- `faixaMin` / `faixaMax`: faixa numérica das dezenas (ex: 1–60 para Mega-Sena, 1–25 para Lotofácil)
- `filtros`:
  - `parImpar`: `{ min, max }` (ex: 2–4 pares)
  - `sequenciais`: `{ maxConsecutivos }` (ex: 3, que proíbe 4+ consecutivos)
  - `soma`: união discriminada `absoluto` (`{ min, max }`) ou `percentil` (`{ minPercentil, maxPercentil }`)
  - `espalhamento`: `{ minLinhas }` (ex: 3+ linhas distintas)
- `colunas` / `linhas`: dimensões da grade de dezenas (ex: 10 colunas × 6 linhas para Mega-Sena)

### Decisões de tipo
- `soma` modelada como união discriminada com `tipo: 'absoluto' | 'percentil'` para evitar campos opcionais e manter `strict` TypeScript.
- Nenhuma instância de configuração criada (será feito nas tarefas 3–4).
- Nenhum arquivo existente modificado.

### Verificado
- `npm run typecheck` passa clean

## Task 3 — Configuração da Mega-Sena (2026-07-18)

### Criado
- `src/config/megasena.ts` exportando `megasenaConfig: LoteriaConfig`

### Valores extraídos do código existente
- `TOTAL_DEZENAS = 60` (`generator.ts` linha 11, `metrics.ts` linha 14) → `faixaMin: 1`, `faixaMax: 60`
- Aposta atualmente hardcoded em 6 dezenas (`generator.ts` linha 65) → `dezenasMin: 6`, `dezenasMax: 6`
- Grade de dezenas usada no filtro de espalhamento (`generator.ts` linha 12 `COLUNAS = 10`, distribuição em 6 linhas) → `colunas: 10`, `linhas: 6`
- Filtro par/ímpar (`generator.ts` linhas 75-78) → `parImpar: { min: 2, max: 4 }`
- Filtro sequencial (`generator.ts` linha 80, rejeita 4+ consecutivos) → `sequenciais: { maxConsecutivos: 3 }`
- Faixa de soma (`metrics.ts` linhas 89-90, percentis 10–90) → `soma: { tipo: 'percentil', minPercentil: 0.1, maxPercentil: 0.9 }`
- Filtro de espalhamento (`generator.ts` linhas 86-88) → `espalhamento: { minLinhas: 3 }`

### Decisões
- `soma` modelada como `percentil` para espelhar o comportamento atual (`faixaSomaDosDados` calcula p10/p90 dinamicamente).
- Nenhum arquivo existente modificado; apenas extração de valores hardcoded.

### Verificado
- `npm run typecheck` passa clean

## Task 5 — Testes de configuração (2026-07-18)

### Criado
- `src/config/config.test.ts` com 25 testes cobrindo Mega-Sena, Lotofácil, validação de tipos e estrutura de filtros

### Validadores runtime
- Adicionados validadores no próprio arquivo de teste (`validarLoteriaConfig`, `validarFiltrosConfig`, `validarSoma`)
- Espelham a estrutura das interfaces sem adicionar dependências
- Testam configurações válidas e inválidas (campos ausentes, limites invertidos, soma sem tipo)

### Cobertura de testes
- Mega-Sena: 7 testes (exportação, campos obrigatórios, id/nome, dezenas, faixa, grade, filtros)
- Lotofácil: 6 testes (exportação, campos obrigatórios, id/nome, dezenas, faixa, grade, filtros)
- Validação de tipos: 5 testes (tipagem das duas configs, rejeição de objetos inválidos)
- Estrutura de filtros: 7 testes (FiltrosConfig completo, soma absoluto/percentil, rejeição de união inválida)

## Task 7 — Chaves de cache por loteria (2026-07-18)

### Modificado
- `src/data/cache.ts`: chave de cache hardcoded `'megasena:concursos:v1'` substituída por geração dinâmica via `CacheKeyManager`

### Criado
- `CacheKeyManager` (classe exportada) com método estático `chaveConcursos(loteriaId: string): string` que retorna `{loteriaId}:concursos:v1`
- Constante interna `LOTERIA_PADRAO = 'megasena'` para manter compatibilidade com o comportamento anterior

### API
- `carregarConcursos` agora aceita `opts.loteriaId?: string` (padrão `'megasena'`)
- Chamadas existentes sem `loteriaId` continuam usando a chave `megasena:concursos:v1`
- Testes existentes que injetam `getCache`/`setCache` com a chave `megasena:concursos:v1` continuam passando sem modificação

### Verificado
- `npm run typecheck && npm test` passa clean
- Todos os 67 testes passam

## Task 8 — Gerenciador de seeds multi-loteria (2026-07-18)

### Criado
- `src/data/seed-manager.ts` exportando `SeedManager`, `seedManager`, `carregarSeedPorLoteria` e `LoteriaId`

### Suporte a múltiplas loterias
- `carregarSeedPorLoteria(lotteryId)` carrega o seed correspondente (`./megasena-seed.json` ou `./lotofacil-seed.json`)
- IDs suportados: `'megasena'`, `'lotofacil'`
- Mapeamento automático para `LoteriaConfig` via `megasenaConfig` e `lotofacilConfig`
- Parsing usa `parseSeedEntries` com a configuração correta para validar dezenas conforme a loteria

### Compatibilidade
- `src/data/seed.ts` permanece inalterado
- `carregarSeed()` continua funcionando como antes para consumidores existentes

### Tratamento de erros
- ID de loteria inválido: lança `Error` com mensagem clara
- Arquivo seed ausente (ex: `lotofacil-seed.json` ainda não existe): loga warning e retorna array vazio, sem quebrar consumidores
- Cache em memória dentro de `SeedManager` evita imports repetidos

### Verificado
- `npm run typecheck` passa clean

## Task 6 — Parametrizar `src/data/parser.ts` com `LoteriaConfig` (2026-07-18)

### Modificado
- `src/data/parser.ts`: todas as funções de validação/parsing agora aceitam um parâmetro opcional `config: LoteriaConfig`

### Funções alteradas
- `isValidConcurso(c, config?)` — valida usando `config.dezenasMin`, `config.dezenasMax`, `config.faixaMin`, `config.faixaMax`
- `parseSeedEntry(e, config?)` — repassa `config` para `isValidConcurso`
- `parseCaixaRaw(raw, config?)` — repassa `config` para `isValidConcurso`
- `parseSeedEntries(entries, config?)` — repassa `config` para `parseSeedEntry`

### Compatibilidade
- Parâmetro `config` é opcional com `megasenaConfig` como valor padrão
- Código existente que não passa config continua funcionando exatamente como antes
- Lógica de validação ajustada para aceitar `dezenasMin <= length <= dezenasMax` e `unicas.size === length`, permitindo loterias com faixa variável de dezenas (ex: Lotofácil 15–20)

### Verificado
- `npm run typecheck && npm test` passa clean após limpar cache do Vite
- Todos os 67 testes passam (inclusive `parser.test.ts` sem modificações)
- Nenhum arquivo de teste alterado

## Task 9 — Testes da camada de dados (parser, cache, seed-manager) (2026-07-18)

### Criado
- `src/data/data-layer.test.ts` com 18 testes divididos em três grupos

### Parser com config (6 testes)
- `isValidConcurso` com config padrão da Mega-Sena
- `isValidConcurso` com config da Lotofácil (15–20 dezenas, faixa 1–25), incluindo casos inválidos (14 dezenas, dezena 26, dezena repetida)
- `parseSeedEntry` com Mega-Sena e Lotofácil, e rejeição sem config
- `parseCaixaRaw` com Mega-Sena e Lotofácil, e rejeição sem config
- `parseSeedEntries` descarta inválidos conforme config e ordena por número
- Backward compatibility: funções sem config usam `megasenaConfig`

### Cache com chaves por loteria (5 testes)
- `CacheKeyManager.chaveConcursos` gera chaves no formato `{loteriaId}:concursos:v1`
- IDs diferentes produzem chaves diferentes
- `carregarConcursos` persiste no cache usando `loteriaId`
- Isolamento de caches entre loterias distintas
- Backward compatibility: sem `loteriaId` usa `megasena:concursos:v1`

### Seed manager (7 testes)
- `SeedManager.carregar` para 'megasena'
- `SeedManager.carregar` para 'lotofacil'
- `carregarSeedPorLoteria` como facade sobre `SeedManager`
- Erro claro para ID de loteria inválido
- Cache em memória: segunda chamada retorna mesma referência
- `limparCache('megasena')` força recarregamento
- `limparCache()` sem argumento limpa todo o cache

### Mock de imports dinâmicos
- `vi.mock('./megasena-seed.json', ...)` e `vi.mock('./lotofacil-seed.json', ...)` no topo do teste interceptam os `import()` dinâmicos de `seed-manager.ts`
- Cada mock retorna `default` com estrutura `SeedFile` e concursos válidos para a loteria

### Verificado
- `npm run typecheck && npm test` passa clean
- Total de testes: 85 (67 anteriores + 18 novos)
- Nenhum arquivo de dados modificado (apenas testes adicionados)

## Task 12 — Validação dos configs de engine (Mega-Sena e Lotofácil) (2026-07-18)

### Verificado
- `src/config/megasena.ts`: 6 dezenas, faixa 1–60, grade 10×6, parImpar 2–4, sequenciais max 3, soma percentil 0.1–0.9, espalhamento min 3 linhas
- `src/config/lotofacil.ts`: 15–20 dezenas, faixa 1–25, grade 5×5, parImpar 6–10, sequenciais max 4, soma absoluto 150–300, espalhamento min 4 linhas
- Ambos os arquivos já estavam corretos em relação aos requisitos do motor

### Ajustes feitos
- Adicionado `validarLoteriaConfig` em `src/config/loterias.ts` para checar invariantes das configurações (limites, grade, filtros, parImpar.max ≤ dezenasMax, espalhamento.minLinhas ≤ linhas, etc.)
- `src/config/megasena.ts` e `src/config/lotofacil.ts` agora chamam `validarLoteriaConfig` no carregamento do módulo, falhando imediatamente se alguma configuração estiver inconsistente
- `src/config/config.test.ts` ganhou um novo grupo de testes cobrindo validação de consistência: configs reais aceitas, parImpar inválido, espalhamento inválido e grade insuficiente

### Verificado
- `npm run typecheck` passa clean
- `npm test` passa com 90 testes (anteriores 85 + 5 novos do grupo de validação de consistência)

## Task 10 — Parametrizar `src/engine/generator.ts` com `LoteriaConfig` (2026-07-18)

### Modificado
- `src/engine/generator.ts`: todas as funções-chave agora aceitam `LoteriaConfig` opcional com `megasenaConfig` como padrão

### Funções alteradas
- `validarCandidato(dezenas, faixa, nivelRelaxamento, loteriaConfig?)` — valida usando `config.dezenasMin`, `config.faixaMin`, `config.faixaMax`, `config.colunas` e `config.filtros`
- `pesosPorDezena(metricas, config, loteriaConfig?)` — arrays dimensionados por `loteriaConfig.faixaMax`, loop de `faixaMin` a `faixaMax`, distribuição uniforme usa `1 / totalDezenas`
- `amostrarJogo(pesosBase, rng, loteriaConfig?)` — amostra `config.dezenasMin` dezenas
- `gerarJogos(metricas, config, rng?, loteriaConfig?)` — repassa configuração para helpers e resolve faixa de soma conforme tipo (`absoluto` ou `percentil`)

### Filtros parametrizados
- `parImpar`: usa `config.filtros.parImpar.min/max`
- `sequenciais`: rejeita quando `maiorSequencia > config.filtros.sequenciais.maxConsecutivos`
- `soma`: `resolverFaixaSoma` escolhe entre valores absolutos (`absoluto`) ou percentis dos dados (`percentil`)
- `espalhamento`: usa `config.filtros.espalhamento.minLinhas` e `config.colunas`

### Compatibilidade
- Parâmetro `loteriaConfig` é opcional com `megasenaConfig` como valor padrão
- Código existente que não passa config continua funcionando exatamente como antes
- Lógica do algoritmo inalterada; apenas valores hardcoded substituídos por parâmetros

### Verificado
- `npm run typecheck && npm test` passa clean
- Total de testes: 85 (todos passam)
- Nenhum arquivo de teste alterado

## Task 13 — Testes do engine parametrizado (Mega-Sena e Lotofácil) (2026-07-18)

### Criado
- `src/engine/engine-multi.test.ts` com 22 testes divididos em quatro grupos

### Cobertura
- **Mega-Sena (6 testes)**: geração com config explícita, 6 dezenas únicas 1–60, filtros padrão (parImpar 2–4, sequenciais ≤3, espalhamento ≥3), compatibilidade sem config (default `megasenaConfig`), soma percentil, determinismo com seed fixa
- **Lotofácil (6 testes)**: geração com `lotofacilConfig`, 15 dezenas únicas 1–25, filtros padrão (parImpar 6–10, sequenciais ≤4, espalhamento ≥4), soma absoluta 150–300, jogos distintos, determinismo com seed fixa
- **Filtros (7 testes)**: parImpar, sequenciais, soma e espalhamento testados individualmente com candidatos que falham apenas no filtro alvo; filtros da Lotofácil; ordem de relaxamento (espalhamento → soma → sequenciais → parImpar); ambas as variantes de soma (`percentil` e `absoluto`)
- **Casos extremos (3 testes)**: métricas vazias (frequência/atraso zerados), filtros muito restritivos (parImpar 6–6 na Mega-Sena) e relaxamento máximo para soma impossível na Lotofácil

### Aprendizados
- `validarCandidato` precisa de candidatos cuidadosamente construídos para isolar um único filtro; caso contrário, múltiplas regras rejeitam e o teste fica ambíguo
- A ordem de relaxamento é fixa: nível 1 relaxa espalhamento, nível 2 relaxa soma, nível 3 relaxa sequenciais e nível 4 relaxa parImpar
- Para Mega-Sena, a soma máxima possível é 345, então uma faixa 400–401 é impossível e força relaxamento
- A Lotofácil usa soma absoluta, então a faixa vem da configuração e não dos percentis das métricas

### Verificado
- `npm run typecheck && npm test` passa clean
- Total de testes: 112 (90 anteriores + 22 novos)
- Nenhum arquivo de produção modificado (apenas testes adicionados)

## Task 14 — Instalar React Router e configurar roteamento básico (2026-07-18)

### Instalação
- Adicionado `react-router-dom` na versão `^7.18.1` (versão 7 mantém compatibilidade com sintaxe v6)

### Arquivos criados
- `src/router.tsx`: configuração central de rotas com `BrowserRouter`, `Routes`, `Route`, `Navigate` e `Suspense`
- `src/pages/MegaSenaPage.tsx`: componente placeholder para a rota `/megasena`
- `src/pages/LotofacilPage.tsx`: componente placeholder para a rota `/lotofacil`

### Estrutura de rotas
- `/` → redireciona para `/megasena` via `<Navigate to="/megasena" replace />`
- `/megasena` → renderiza `MegaSenaPage` (carregada com `React.lazy`)
- `/lotofacil` → renderiza `LotofacilPage` (carregada com `React.lazy`)

### Lazy loading
- Páginas de loteria importadas com `React.lazy(() => import('./pages/...'))`
- `Suspense` envolve o `<Routes>` e exibe um fallback de carregamento reutilizando as classes de spinner do projeto

### Decisões
- `AppRouter` exportado como componente React, pronto para ser montado no ponto de entrada sem modificar componentes existentes
- Nenhum componente existente foi alterado (Task 16 fará a implementação completa das páginas)

### Verificado
- `npm run typecheck` passa clean

## Task 16 — Integrar componentes nas páginas de loteria e conectar roteamento (2026-07-18)

### Modificado
- `src/pages/MegaSenaPage.tsx`: substituído placeholder por layout completo com `LotteryTabs`, `Dashboard`, `Controls` e `SuggestedGames`; usa `megasenaConfig.id` no `useConcursos`.
- `src/pages/LotofacilPage.tsx`: idem, com `lotofacilConfig`.
- `src/hooks/useConcursos.ts`: hook agora aceita `loteriaId?: string` e repassa para `carregarConcursos`.
- `src/data/cache.ts`: `CacheDeps.seed` permite função assíncrona; `carregarConcursos` usa `carregarSeedPorLoteria(loteriaId)` como seed padrão quando um ID é informado, mantendo `carregarSeed` para chamadas sem `loteriaId` (compatibilidade).
- `src/main.tsx`: ponto de entrada renderiza `AppRouter` no lugar de `App`; `App.tsx` permanece inalterado para compatibilidade.

### Decisões
- Cada página passa sua própria configuração (`megasenaConfig`/`lotofacilConfig`) para o título, `useConcursos` e estrutura.
- `Dashboard`, `Controls` e `SuggestedGames` não foram alterados (Task 17); por isso, a página da Lotofácil ainda renderiza métricas/cálculos com suposições da Mega-Sena (limitação temporária documentada).
- `LotteryTabs` foi posicionado no topo de cada página, acima do cabeçalho.

### Limitações conhecidas
- `src/api/base.ts` ainda aponta para o endpoint da Mega-Sena; a busca incremental de novos concursos via API para Lotofácil precisará de endpoint/config parametrizável em tarefa futura.
- O arquivo `src/data/lotofacil-seed.json` ainda não existe; `SeedManager` retorna array vazio com warning, sem quebrar a página.

### Verificado
- `npm run typecheck && npm test` passa clean
- Total de testes: 112 (todos passam)
- `npm run build` passa e gera chunks separados para `MegaSenaPage` e `LotofacilPage`

## Task 11 — Extrair filtros hardcoded de `src/engine/generator.ts` para config (2026-07-18)

### Status
- Requisitos já atendidos pela Task 10 (parametrização do engine com `LoteriaConfig`).
- Nenhuma alteração de código necessária além de reforçar a documentação da ordem de relaxamento.

### Verificação dos requisitos
1. **Limites dos filtros vêm de `config.filtros`:**
   - `validarCandidato` usa `loteriaConfig.filtros.parImpar.min/max` no lugar de `2`/`4`
   - Sequenciais usam `loteriaConfig.filtros.sequenciais.maxConsecutivos` (rejeita `> maxConsecutivos`, equivalente ao antigo `>= 4` quando `maxConsecutivos === 3`)
   - Espalhamento usa `loteriaConfig.filtros.espalhamento.minLinhas` no lugar de `3`
2. **Soma com união discriminada:**
   - `resolverFaixaSoma(metricas, loteriaConfig)` trata `tipo: 'absoluto'` (`min`/`max`) e `tipo: 'percentil'` (`p10`/`p90` das métricas)
3. **Ordem de relaxamento documentada:**
   - `FILTRO_POR_NIVEL` em `src/engine/generator.ts` documenta a ordem fixa: `espalhamento → soma → sequenciais → parImpar`
   - Comentário reforçado explicando que a ordem remove primeiro os filtros mais restritivos

### Compatibilidade
- `loteriaConfig` é opcional e padroniza para `megasenaConfig`, mantendo o comportamento atual da Mega-Sena
- Nenhum teste existente precisou de modificação

### Verificado
- `npm run typecheck && npm test` passa clean
- Total de testes: 90 (todos passam)

## Task 15 — Componente de abas de loteria (2026-07-18)

### Criado
- `src/components/layout/lottery-tabs.tsx` exportando `LotteryTabs`
- `src/components/layout` criada para componentes de estrutura/layout

### Funcionalidade
- Abas para Mega-Sena (`/megasena`) e Lotofácil (`/lotofacil`)
- Navegação via React Router (`Link` e `useLocation`)
- Aba ativa destacada com classe `.lottery-tabs__tab--active`
- Atributos ARIA: `role="tablist"` na lista, `role="tab"` em cada aba, `aria-selected` booleano
- `aria-label="Loterias"` no `<nav>` para contexto de leitores de tela

### Estilos
- Adicionados em `src/index.css` usando variáveis existentes (`--accent`, `--panel-2`, `--border`, `--text`)
- Layout flex com `flex-wrap` e breakpoint em 720px para empilhar abas em mobile
- Estados hover/focus-visible e aba ativa com cor de destaque

### Decisões
- Componente em inglês (`LotteryTabs`) para manter consistência com os componentes existentes (`Dashboard`, `Controls`, `SuggestedGames`)
- Nomes de classe em inglês (BEM) e alinhados ao nome do arquivo
- Sem dependências externas; nenhum componente existente modificado

### Verificado
- `npm run typecheck` passa clean

## Task 17 — Parametrizar Dashboard, Controls e SuggestedGames com LoteriaConfig

### Modificado
- `src/components/Dashboard.tsx`: aceita `config?: LoteriaConfig` (padrão `megasenaConfig`); substituiu valores hardcoded da Mega-Sena por `config.dezenasMin` nos rótulos par/ímpar e no destaque de equilíbrio.
- `src/components/Controls.tsx`: aceita `config?: LoteriaConfig` (padrão `megasenaConfig`) para manter a interface uniforme; opções de janela permanecem genéricas.
- `src/components/SuggestedGames.tsx`: aceita `config?: LoteriaConfig` (padrão `megasenaConfig`); repassa a configuração para `gerarJogos` e parametriza o aviso de honestidade estatística com `config.nome`, `config.dezenasMin` e `config.faixaMax` (probabilidade calculada por C(n, k)).
- `src/pages/MegaSenaPage.tsx`: passa `megasenaConfig` para `Dashboard`, `Controls` e `SuggestedGames`.
- `src/pages/LotofacilPage.tsx`: passa `lotofacilConfig` para `Dashboard`, `Controls` e `SuggestedGames`.

### Compatibilidade
- O prop `config` é opcional em todos os componentes; chamadas sem config continuam usando `megasenaConfig`, preservando o comportamento anterior.
- Testes existentes de `Dashboard` e `SuggestedGames` não precisaram de alterações.

### Verificado
- `npm run typecheck` passa clean
- `npm test` passa com 112 testes (todos passam)

## Task 18 — Testes de UI multi-loteria (LotteryTabs, rotas, componentes parametrizados)

### Criado
- `src/components/ui-multi.test.tsx` com 19 testes divididos em três grupos

### Cobertura
- **LotteryTabs (5 testes)**: renderização das duas abas, destaque ativo para `/megasena` e `/lotofacil`, manutenção do destaque em rotas filhas (`/megasena/detalhes`), navegação por clique e atributos ARIA (`role="tablist"`, `role="tab"`, `aria-selected`, `aria-current`).
- **Rotas (4 testes)**: redirecionamento de `/` para `/megasena`, `/megasena` renderiza `MegaSenaPage`, `/lotofacil` renderiza `LotofacilPage` e lazy loading sob `Suspense`.
- **Componentes parametrizados (10 testes)**:
  - `Dashboard`: renderiza com `megasenaConfig` e `lotofacilConfig`, verificando rótulos par/ímpar parametrizados por `config.dezenasMin`.
  - `Controls`: renderiza com ambas as configs e reflete `janela` correta (`aria-pressed`).
  - `SuggestedGames`: renderiza com ambas as configs, gera 5 jogos com 6 dezenas (Mega-Sena) ou 15 dezenas (Lotofácil), provando que `config` chega a `gerarJogos`; textos de probabilidade corretos (`1 em 50.063.860` vs `1 em 3.268.760`).

### Técnicas
- Páginas `MegaSenaPage` e `LotofacilPage` mockadas com `vi.mock` para isolar o roteamento dos hooks de dados/IndexedDB.
- `MemoryRouter` usado para testar `<LotteryTabs>`; `BrowserRouter` do `AppRouter` controlado via `window.history.pushState` nos testes de rotas.
- Métricas construídas manualmente para a Lotofácil (25 dezenas) a fim de alinhar com `lotofacilConfig`.

### Verificado
- `npm run typecheck && npm test` passa clean
- Total de testes: 131 (112 anteriores + 19 novos)
- Nenhum componente de produção modificado (apenas testes adicionados)

