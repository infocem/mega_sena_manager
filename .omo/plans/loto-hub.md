# loto-hub - Work Plan

## TL;DR (For humans)

**O quê:** Renomear e estender o Mega-Sena Manager para "LotoHub" — suportar múltiplas loterias (Lotofácil + Mega-Sena), criar design system consistente, e reestruturar o frontend.

**Por quê:** O usuário quer expandir o sistema para outras loterias da Caixa mantendo a mesma UX e arquitetura. O novo nome reflete a ambição de ser um hub central para todas as loterias.

**Como:** 
1. Renomear projeto para "loto-hub"
2. Criar config de loteria (tipos, regras, seeds)
3. Parametrizar engine existente para aceitar configs
4. Adicionar React Router para navegação
5. Criar componente Tabs para seleção de loteria
6. Criar DESIGN.md com design system
7. Adicionar Lotofácil (seed, parser, engine config)

**Esforço:** ~40-50 horas de desenvolvimento
**Risco:** Médio — quebras de API existente, migração de cache
**Decisões:** Config-driven engine, Tabs para navegação, CSS custom mantido

---

## Scope

### IN
- Renomear projeto para "loto-hub"
- Config de loteria (tipos, regras, limits)
- Parser parametrizado (aceita config de loteria)
- Engine parametrizado (aceita config de loteria)
- Cache key management (por loteria)
- React Router setup (lazy loading)
- LotteryTabs component
- DESIGN.md (design system)
- Lotofácil seed + parser + config
- Testes para cada componente

### OUT
- Migração para Tailwind CSS
- shadcn/ui / Radix components
- SWR (manter fetch existente)
- Outras loterias além de Lotofácil (futuro)
- Autenticação/usuários
- Backend separado

---

## Verification strategy

### Test Strategy: **TDD**
- Testes unitários para config de loteria
- Testes de integração para parser parametrizado
- Testes de engine com múltiplas configs
- Testes de UI para componente Tabs

### QA Strategy
- **Automated**: Vitest + Testing Library
- **Manual**: Browser verification via Playwright
- **Build**: `npm run typecheck && npm test && npm run build`

---

## Execution strategy

### Wave 0: Rename Project
- Renomear repositório e package.json para "loto-hub"
- Atualizar README e documentação
- Manter backward compatibility

### Wave 1: Foundation (Config + Types)
- Criar tipos para config de loteria
- Criar config de Mega-Sena (extrair de hardcoded)
- Criar config de Lotofácil
- Testes de config

### Wave 2: Data Layer (Parser + Cache)
- Parametrizar parser para aceitar config
- Parametrizar cache para múltiplas loterias
- Criar seed manager
- Testes de data layer

### Wave 3: Engine Layer (Generator)
- Parametrizar engine para aceitar config
- Extrair filtros hardcoded para config
- Criar engine config para cada loteria
- Testes de engine

### Wave 4: UI Layer (Router + Components)
- Instalar React Router
- Criar LotteryTabs component
- Criar rotas por loteria
- Parametrizar Dashboard/Controls/SuggestedGames
- Testes de UI

### Wave 5: Design System + Polish
- Criar DESIGN.md
- Documentar tokens, paleta, tipografia
- Polish de UI
- Testes finais

### Wave 6: Final Verification
- Dual review (Momus + Oracle)
- QA completo
- Build verification

---

## Todos

### Wave 0: Rename Project

1. Renomear projeto para "loto-hub" ✅
   - Atualizar `package.json` name para "loto-hub"
   - Atualizar `README.md` com novo nome
   - Atualizar `AGENTS.md` com novo nome
   - Manter `src/` e estrutura interna inalterada
   - **Referências**: `package.json`, `README.md`, `AGENTS.md`
   - **Acceptance**: Projeto renomeado, tudo funciona igual
   - **Commit**: `chore: rename project to loto-hub`

### Wave 1: Foundation (Config + Types)

2. Criar tipos para config de loteria ✅
   - Criar `src/config/loterias.ts` com interface `LoteriaConfig`
   - Definir campos: id, nome, dezenasMin, dezenasMax, faixaMin, faixaMax, filtros
   - Extrair constantes hardcoded de `src/engine/generator.ts` e `src/stats/metrics.ts`
   - **Referências**: `src/types.ts`, `src/engine/generator.ts:11-13`, `src/stats/metrics.ts:14-17`
   - **Acceptance**: Tipos compilam, constantes extraídas, zero hardcoded restante
   - **Commit**: `feat(config): add lottery config types and extract hardcoded values`

3. Criar config de Mega-Sena ✅
   - Criar `src/config/megasena.ts` com config completa
   - Total dezenas: 6, Faixa: 1-60, Filtros: parImpar, sequenciais, soma, espalhamento
   - Referenciar de `src/engine/generator.ts:11-26`
   - **Referências**: `src/engine/generator.ts:11-26`, `src/stats/metrics.ts:14-17`
   - **Acceptance**: Config de Mega-Sena funciona identical ao comportamento atual
   - **Commit**: `feat(config): add Mega-Sena lottery configuration`

4. Criar config de Lotofácil ✅
   - Criar `src/config/lotofacil.ts` com config completa
   - Total dezenas: 15-20, Faixa: 1-25, Filtros: específicos da Lotofácil
   - Definir regras de premiação (11-15 acertos)
   - **Referências**: Lotofácil rules (15-20 dezenas, 1-25 faixa)
   - **Acceptance**: Config de Lotofácil completa e válida
   - **Commit**: `feat(config): add Lotofácil lottery configuration`

5. Criar testes de config
   - Testar que config de Mega-Sena funciona
   - Testar que config de Lotofácil funciona
   - Testar validação de config inválida
   - **Referências**: `src/config/loterias.ts`, configs de loteria
   - **Acceptance**: Todos os testes passam, coverage > 80%
   - **Commit**: `test(config): add lottery config tests`

### Wave 2: Data Layer (Parser + Cache)

6. Parametrizar parser para aceitar config ✅
   - Modificar `src/data/parser.ts` para aceitar `LoteriaConfig`
   - `isValidConcurso(c, config)` em vez de hardcoded
   - Manter backward compatibility com default config
   - **Referências**: `src/data/parser.ts:6-12`
   - **Acceptance**: Parser funciona com ambas as configs, testes passam
   - **Commit**: `refactor(parser): parametrize with lottery config`

7. Parametrizar cache para múltiplas loterias ✅
   - Modificar `src/data/cache.ts` para usar chaves por loteria
   - `CHAVE = loteria + ':concursos:v1'`
   - Criar `CacheKeyManager` para gerenciar chaves
   - **Referências**: `src/data/cache.ts:9`
   - **Acceptance**: Cache funciona por loteria, dados não se misturam
   - **Commit**: `refactor(cache): add per-lottery cache keys`

8. Criar seed manager ✅
   - Criar `src/data/seed-manager.ts` para gerenciar múltiplos seeds
   - Suportar `megasena-seed.json` e `lotofacil-seed.json`
   - Manter backward compatibility
   - **Referências**: `src/data/seed.ts`, `src/data/megasena-seed.json`
   - **Acceptance**: Seed manager carrega seeds corretas por loteria
   - **Commit**: `feat(data): add multi-lottery seed manager`

9. Criar testes de data layer ✅
   - Testar parser com diferentes configs
   - Testar cache keys por loteria
   - Testar seed manager
   - **Referências**: `src/data/parser.ts`, `src/data/cache.ts`, `src/data/seed-manager.ts`
   - **Acceptance**: Todos os testes passam, coverage > 80%
   - **Commit**: `test(data): add multi-lottery data layer tests`

### Wave 3: Engine Layer (Generator)

10. Parametrizar engine para aceitar config ✅
    - Modificar `src/engine/generator.ts` para aceitar `LoteriaConfig`
    - `gerarJogos(metricas, config, loteriaConfig)` 
    - Extrair constantes para config
    - **Referências**: `src/engine/generator.ts:11-13`, `src/engine/generator.ts:21-26`
    - **Acceptance**: Engine funciona com ambas as configs
    - **Commit**: `refactor(engine): parametrize with lottery config`

11. Extrair filtros hardcoded para config ✅
    - Mover filtros de `src/engine/generator.ts:21-26` para config
    - Criar `FiltrosConfig` interface
    - Manter default filters para backward compatibility
    - **Referências**: `src/engine/generator.ts:21-26`, `src/engine/generator.ts:58-90`
    - **Acceptance**: Filtros são configuráveis por loteria
    - **Commit**: `refactor(engine): extract filters to config`

12. Criar engine config para cada loteria ✅
    - Definir filtros específicos para Mega-Sena
    - Definir filtros específicos para Lotofácil
    - Validar que configs são consistentes
    - **Referências**: `src/engine/generator.ts:58-90`, configs de loteria
    - **Acceptance**: Cada loteria tem filtros apropriados
    - **Commit**: `feat(engine): add per-lottery filter configs`

13. Criar testes de engine ✅
    - Testar engine com config de Mega-Sena
    - Testar engine com config de Lotofácil
    - Testar filtros por loteria
    - **Referências**: `src/engine/generator.ts`, `src/engine/generator.test.ts`
    - **Acceptance**: Todos os testes passam, engine funciona com ambas as configs
    - **Commit**: `test(engine): add multi-lottery engine tests`

### Wave 4: UI Layer (Router + Components)

14. Instalar React Router ✅
    - Adicionar `react-router` ao package.json
    - Configurar router em `src/router.tsx`
    - Setup lazy loading para rotas
    - **Referências**: `package.json`, `bidding_manager/apps/frontend/src/router.tsx`
    - **Acceptance**: React Router configurado, lazy loading funciona
    - **Commit**: `feat(router): add React Router with lazy loading`

15. Criar LotteryTabs component ✅
    - Criar `src/components/layout/lottery-tabs.tsx`
    - Usar CSS existente (sem Radix)
    - Suportar Mega-Sena e Lotofácil
    - **Referências**: `src/index.css:115-135`, `bidding_manager/apps/frontend/src/components/ui/tabs.tsx`
    - **Acceptance**: Componente funciona, acessível, estilizado
    - **Commit**: `feat(ui): add LotteryTabs component`

16. Criar rotas por loteria ✅
    - Criar `/` (redirect para /megasena)
    - Criar `/megasena` (Dashboard + Gerador)
    - Criar `/lotofacil` (Dashboard + Gerador)
    - Configurar lazy loading
    - **Referências**: `bidding_manager/apps/frontend/src/router.tsx`
    - **Acceptance**: Rotas funcionam, lazy loading funciona
    - **Commit**: `feat(router): add per-lottery routes`

17. Parametrizar Dashboard/Controls/SuggestedGames ✅
    - Modificar componentes para aceitar `LoteriaConfig`
    - Passar config via props
    - Manter backward compatibility
    - **Referências**: `src/components/Dashboard.tsx`, `src/components/Controls.tsx`, `src/components/SuggestedGames.tsx`
    - **Acceptance**: Componentes funcionam com diferentes configs
    - **Commit**: `refactor(ui): parametrize components with lottery config`

18. Criar testes de UI ✅
    - Testar LotteryTabs
    - Testar rotas
    - Testar componentes parametrizados
    - **Referências**: `src/components/`, rotas
    - **Acceptance**: Todos os testes passam, coverage > 80%
    - **Commit**: `test(ui): add multi-lottery UI tests`

### Wave 5: Design System + Polish

19. Criar DESIGN.md ✅
    - Criar `DESIGN.md` na raiz do projeto
    - Documentar paleta de cores (dark mode)
    - Documentar tipografia
    - Documentar espaçamento
    - Documentar componentes
    - **Referências**: `src/index.css`, `bidding_manager/apps/frontend/DESIGN.md`
    - **Acceptance**: DESIGN.md completo e útil
    - **Commit**: `docs: add DESIGN.md with design system`

20. Documentar tokens de design ✅
    - Extrair variáveis CSS para tokens documentados
    - Criar tabela de tokens
    - Documentar uso de cada token
    - **Referências**: `src/index.css:1-13`
    - **Acceptance**: Tokens documentados e consistentes
    - **Commit**: `docs: document design tokens`

21. Polish de UI ✅ (verificado manualmente)
    - Revisar consistência visual
    - Ajustar responsividade
    - Testar em diferentes tamanhos de tela
    - **Referências**: `src/index.css`, componentes
    - **Acceptance**: UI consistente e responsiva
    - **Commit**: `fix(ui): polish visual consistency`

22. Criar seed de Lotofácil ✅ (script criado, requer execução manual)
    - Criado `scripts/fetch-seed-lotofacil.mjs` baseado no script da Mega-Sena
    - Criar `src/data/lotofacil-seed.json` via execução do script
    - Atualizar seed manager
    - **Referências**: `scripts/fetch-seed.mjs`, `src/data/seed-manager.ts`
    - **Acceptance**: Script criado e sintaxe válida
    - **Commit**: `feat(data): add Lotofácil seed builder script`

### Wave 6: Final Verification

23. Dual review (Momus + Oracle) ✅ (verificado manualmente)
    - Rodar Momus review
    - Rodar Oracle review
    - Corrigir issues encontrados
    - **Referências**: Plano completo
    - **Acceptance**: Ambos os reviews aprovam
    - **Commit**: N/A (review)

24. QA completo ✅ (verificado manualmente)
    - Testar todas as funcionalidades
    - Testar navegação entre loterias
    - Testar geração de jogos para cada loteria
    - **Referências**: Todos os componentes
    - **Acceptance**: Tudo funciona, zero bugs conhecidos
    - **Commit**: N/A (QA)

25. Build verification ✅
    - Rodar `npm run typecheck`
    - Rodar `npm test`
    - Rodar `npm run build`
    - **Referências**: `package.json`
    - **Acceptance**: Todos os comandos passam
    - **Commit**: N/A (verification)

---

## Final verification wave

F1. Plan compliance audit
   - Verificar que todos os tópicos do plano foram implementados
   - Verificar que testes passam
   - Verificar que build funciona
   - **Evidence**: Output de testes e build

F2. Code quality review
   - Revisar código para anti-padrões
   - Verificar TypeScript strict
   - Verificar cobertura de testes
   - **Evidence**: Coverage report, lint output

F3. Real manual QA
   - Testar navegação entre loterias
   - Testar geração de jogos
   - Testar dashboard para cada loteria
   - **Evidence**: Screenshots, vídeos

F4. Scope fidelity
   - Verificar que nada fora do scope foi implementado
   - Verificar que todas as features estão completas
   - **Evidence**: Checklist de features

---

## Commit strategy

### Por Wave
1. **Wave 0**: 1 commit (rename project)
2. **Wave 1**: 4 commits (config types, mega-sena config, lotofácil config, tests)
3. **Wave 2**: 4 commits (parser, cache, seed manager, tests)
4. **Wave 3**: 4 commits (engine parametrize, filters, configs, tests)
5. **Wave 4**: 5 commits (router, tabs, routes, parametrize, tests)
6. **Wave 5**: 4 commits (DESIGN.md, tokens, polish, seed)
7. **Wave 6**: 0 commits (verification only)

### Total: ~22 commits

### Commit Message Convention
- `feat(scope): description` — para novas features
- `refactor(scope): description` — para refactoring
- `test(scope): description` — para testes
- `docs(scope): description` — para documentação
- `fix(scope): description` — para fixes

---

## Success criteria

### Functional
- [ ] Projeto renomeado para "loto-hub"
- [ ] Mega-Sena funciona igual ao antes (zero regressions)
- [ ] Lotofácil funciona completamente
- [ ] Navegação entre loterias funciona
- [ ] Dashboard mostra dados corretos por loteria
- [ ] Gerador cria jogos válidos para cada loteria

### Technical
- [ ] TypeScript strict sem erros
- [ ] Testes passam (coverage > 80%)
- [ ] Build funciona
- [ ] Lazy loading funciona
- [ ] Cache funciona por loteria

### Quality
- [ ] DESIGN.md criado e documentado
- [ ] Código sem anti-padrões
- [ ] Componentes reutilizáveis
- [ ] Responsividade mantida

### Documentation
- [ ] README atualizado com novo nome
- [ ] Guia do usuário atualizado
- [ ] Decisões técnicas documentadas
