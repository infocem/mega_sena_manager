# Decisions - LotoHub Plan

## Architectural Decisions

### Config-Driven Engine
- Extract all hardcoded lottery-specific values to config objects
- Each lottery (Mega-Sena, Lotofácil) has its own config
- Engine, parser, metrics accept config as parameter
- Backward compatibility via default configs

### Cache Strategy
- Per-lottery cache keys: `{loteria}:concursos:v1`
- CacheKeyManager to centralize key generation
- No data mixing between lotteries

### Seed Management
- Seed manager supports multiple seed files
- `megasena-seed.json` (existing)
- `lotofacil-seed.json` (to be created)
- Backward compatible with current seed loader

### UI Navigation
- React Router with lazy loading
- LotteryTabs component for lottery selection
- Routes: `/` → `/megasena`, `/lotofacil`
- Components parametrized via props (LoteriaConfig)

### Design System
- DESIGN.md with tokens, palette, typography
- CSS custom properties (no Tailwind, no shadcn)
- Consistent with existing dark mode
