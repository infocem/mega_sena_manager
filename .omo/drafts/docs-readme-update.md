---
slug: docs-readme-update
status: approved
intent: clear
review_required: false
pending-action: write .omo/plans/docs-readme-update.md
approach: Incrementar README.md com features + Capacitor + link para docs; criar docs/GUIA-USUARIO.md com glossário, dashboard, gerador, filtros e FAQ
---

# Draft: docs-readme-update

## Components (topology ledger)
| id | outcome | status | evidence |
|----|---------|--------|----------|
| 1 | README.md incrementado com 3 novas seções | active | README.md:1-83 |
| 2 | docs/GUIA-USUARIO.md criado com guia completo | active | src/types.ts, src/stats/metrics.ts, src/engine/generator.ts |

## Open assumptions (announced defaults)
| assumption | adopted default | rationale | reversible? |
|------------|----------------|-----------|-------------|
| Idioma da documentação | Português (BR) | Todo o código e UI estão em PT-BR | yes |
| Formato do guia | Markdown único | Simples, renderiza no GitHub, sem tooling extra | yes |

## Findings (cited - path:lines)
- README atual: 83 linhas, cobre stack/comandos/arquitetura de dados. Faltam features, Capacitor, docs link. (README.md:1-83)
- package.json tem 4 scripts Capacitor não documentados (cap:sync, cap:open, cap:build:debug, cap:build:release) (package.json:13-16)
- Dashboard tem 4 painéis: frequência, par/ímpar, maiores atrasos, soma (Dashboard.tsx:38-128)
- Gerador tem 3 pesos (quentes/atrasadas/aleatório), quantidade 1-20, botão regenerar (SuggestedGames.tsx:48-99)
- Filtros estruturais: 2-4 pares, sem 4+ sequenciais, soma p10-p90, espalhamento ≥3 linhas (generator.ts:59-90)
- Relaxamento progressivo: 4 níveis que desativam filtros em ordem (generator.ts:21-26)
- Tipos de domínio: Concurso, FrequenciaItem, AtrasoItem, Pesos, Jogo, Janela, etc. (types.ts:1-104)
- Aviso de honestidade: "Nenhuma análise aumenta a probabilidade real de acerto" (SuggestedGames.tsx:41-46)
- Janela de análise: 50, 100, 500 ou Tudo (Controls.tsx:5-10)
- PRNG determinístico mulberry32 com seed injetável (rng.ts:7-16)

## Decisions (with rationale)
- Documentação em docs/GUIA-USUARIO.md (usuário escolheu)
- README incrementado, não reestruturado (usuário escolheu)
- Glossário como primeira seção do guia (termos são pré-requisito para entender o resto)

## Scope IN
- Atualizar README.md: adicionar seção Funcionalidades, scripts Capacitor, link para guia
- Criar docs/GUIA-USUARIO.md com: glossário, dashboard, gerador, filtros, FAQ, aviso honestidade

## Scope OUT (Must NOT have)
- Não reestruturar seções existentes do README
- Não criar site de documentação (Docusaurus, VitePress, etc.)
- Não adicionar screenshots (não temos ainda)
- Não traduzir para inglês
- Não modificar código-fonte

## Open questions
(nenhuma - todas resolvidas na entrevista)

## Approval gate
status: approved
