# Evidence: Task 2 — Glossário no GUIA-USUARIO.md

**Timestamp:** 2026-07-05

**Número de termos no glossário:** 15

**Seeds separados:** sim — "Seed do Gerador" (número que controla o PRNG) e "Seed de Dados" (arquivo JSON com histórico) são entradas distintas com definições independentes.

**Espalhamento correto (grupos de 10):** sim — a definição menciona explicitamente os grupos 01-10, 11-20, 21-30, 31-40, 41-50 e 51-60.

**Verificação:**
- `grep -c "^### " docs/GUIA-USUARIO.md` → 15 ✓
- `grep "seed do gerador" docs/GUIA-USUARIO.md` → encontrado na linha 55 ✓
- `grep "seed de dados" docs/GUIA-USUARIO.md` → encontrado na linha 59 ✓
- `grep "01-10" docs/GUIA-USUARIO.md` → encontrado na linha 47 ✓

**Observações:** Nenhuma. Conteúdo existente (título, introdução, aviso) preservado intacto. Seção Glossário adicionada após o aviso de honestidade estatística.
