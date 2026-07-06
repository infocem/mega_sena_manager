# Task 4: docs/GUIA-USUARIO.md — Seção Gerador de Jogos

**Timestamp:** 2026-07-05

## Checklist de Verificação

| Critério | Status |
|---|---|
| Seção `## Gerador de Jogos` adicionada | Sim (linha 127) |
| Valores iniciais (40/40/20) mencionados | Sim (linha 135) |
| Aviso de honestidade presente | Sim (linha 5 + seção dedicada linha 159) |

## Detalhes

- **Seção adicionada após:** linha 125 (fim da seção Dashboard)
- **Subseções criadas:** Pesos de Seleção, Quantidade de Jogos, Botão Regenerar, Formato de Cada Jogo, Aviso de Honestidade
- **Conteúdo existente preservado:** título, introdução, aviso inicial, glossário (15 termos), dashboard (5 subseções) — nenhum conteúdo removido

## Observações

- O aviso de honestidade aparece duas vezes no documento: no topo (linha 5, aviso geral) e na seção Gerador (linha 159, reforço contextualizado). Isso é intencional e alinhado com a requirement de "aviso reforçado".
- Os valores 40/40/20 foram confirmados contra `src/components/SuggestedGames.tsx:13` (`PESOS_INICIAIS`).
- A explicação do critério "Misto" reflete a lógica de `descreverCriterio()` em `src/engine/generator.ts:132-143`.
