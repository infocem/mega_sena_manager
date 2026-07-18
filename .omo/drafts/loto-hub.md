# Draft: LotoHub (Multi-Lottery)

## Intent
**UNCLEAR** — The user wants to extend the system to support multiple lottery types, starting with Lotofácil, and restructure the frontend with a design system approach.

## Review Required
✅ Sim — review completo (Momus + Oracle) solicitado pelo usuário

## Decisões Tomadas

### 1. Nome do Projeto
**loto-hub** (recomendação aceita)
- Reflete a ambição de ser um hub central para loterias
- Curto, memorável, profissional
- Escala para qualquer loteria

### 2. Loterias alvo
**Apenas Lotofácil + Mega Sena** (recomendação aceita)
- Foco: Lotofácil como segunda loteria
- Menor superfície de implementação
- Entrega mais rápida

### 3. Navegação UI
**Abas/Tabs** (recomendação aceita)
- Uma aba por loteria no topo
- Dashboard + Gerador contextuais
- Mais simples que rotas separadas

### 4. Arquitetura do engine
**Config-driven** (recomendação aceita)
- Um único engine parametrizado por config
- Config inclui: totalDezenas, faixa, filtros
- Menos código, mais flexível

### 5. Design System
**Abordagem intermediária** (decisão do planejador)
- Criar DESIGN.md com tokens do loto-hub
- Componentes UI leves (sem shadcn/ui)
- Manter CSS custom existente
- Não migrar para Tailwind agora

## Componentes Identificados

### Top-level (6 componentes)
1. **RenameProject** — Renomear de mega_sena_manager para loto-hub
2. **LotteryTabs** — Abas de seleção de loteria
3. **LotteryConfig** — Configuração por loteria (src/config/loterias.ts)
4. **DesignSystem** — DESIGN.md + tokens
5. **RouterSetup** — React Router com lazy loading
6. **SeedManager** — Suporte a múltiplos seeds

### Data Layer (3 componentes)
1. **LoteriaConfig** — Interface para config de loteria
2. **ParserParametrizado** — Parser que aceita config
3. **CacheKeyManager** — Chaves de cache por loteria

### Engine Layer (2 componentes)
1. **GeneratorConfig** — Config do engine por loteria
2. **FiltersConfig** — Filtros estruturais por loteria

### UI Layer (4 componentes)
1. **LotteryTabs** — Componente de abas
2. **DashboardParametrizado** — Dashboard que aceita config
3. **ControlsParametrizado** — Controls que aceita config
4. **SuggestedGamesParametrizado** — Gerador que aceita config

## Risks Identified

### Technical Risks
1. **Breaking changes** — Modificar tipos existentes pode quebrar testes
2. **Cache migration** — Usuários existentes precisam de migração
3. **API compatibility** — Lotofácil pode ter formato diferente

### Scope Risks
1. **Scope creep** — Tentar fazer tudo de uma vez
2. **Design system** — Pode consumir tempo demais
3. **Testing** — Cada loteria precisa de testes próprios

## Open Questions (Resolved)

1. ✅ Nome do projeto? → loto-hub
2. ✅ Quais loterias? → Lotofácil + Mega Sena
3. ✅ Navegação? → Abas/Tabs
4. ✅ Engine? → Config-driven
5. ✅ Review? → Dual review completo

## Next Steps
1. Criar draft com decisões ✅
2. Criar plano detalhado ✅
3. Rodar Metis gap analysis
4. Rodar dual review (Momus + Oracle)
5. Apresentar para aprovação

## Status
**awaiting-approval** — Plano criado, aguardando aprovação do usuário
