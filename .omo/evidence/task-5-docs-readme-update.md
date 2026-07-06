# Evidence: Task 5 — docs/GUIA-USUARIO.md Filtros Estruturais

**Timestamp:** 2026-07-05

## Checklist

| Critério | Status |
|----------|--------|
| Seção `## Filtros Estruturais` adicionada | Sim (linha 165) |
| 4 filtros explicados (Par/Ímpar, Soma na Faixa, Sem Sequenciais Longos, Espalhamento) | Sim (linhas 169-200) |
| Relaxamento progressivo explicado com subseção | Sim (linhas 202-216) |
| Espalhamento definido como grupos de 10 | Sim (tabela linhas 191-198) |
| Thresholds exatos: 2-4 pares | Sim (linha 171) |
| Thresholds exatos: ≥4 sequenciais rejeitados | Sim (linha 183) |
| Thresholds exatos: ≥3 grupos distintos | Sim (linha 189) |
| Mensagem de relaxamento documentada | Sim (linha 216) |
| Conteúdo existente preservado | Sim |

## Verificação

```
grep "## Filtros" → encontrou em linha 49 (glossário) e 165 (nova seção)
grep "relaxamento" → encontrou 2 ocorrências na nova seção
grep "01-10" / "01–10" → encontrou no glossário e na tabela de espalhamento
```

## Observações

Nenhuma. A seção foi adicionada após a linha 163 (fim da seção Gerador), preservando todo o conteúdo existente. O arquivo passou de 163 para 217 linhas (+54 linhas).
