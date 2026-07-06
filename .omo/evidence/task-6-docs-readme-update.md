# Task 6: Adicionar FAQ e Aviso Legal ao GUIA-USUARIO.md

**Timestamp:** 2026-07-05

**Seção FAQ adicionada:** sim
**Número de perguntas no FAQ:** 5
**Seção Aviso Legal adicionada:** sim

## Verificação

- `grep "## Perguntas Frequentes"`: encontrado na linha 218
- `grep "## Aviso Legal"`: encontrado na linha 240
- `grep -c "^### "`: 35 headings (≥20 requerido)

## Observações

- Seções inseridas após a seção Filtros Estruturais (linha 217 do arquivo original)
- Conteúdo existente preservado integralmente
- Perguntas cobrem: estatísticas e chance de ganhar, dezenas atrasadas, critério Misto, filtros relaxados, janela de análise
- Aviso Legal reforça honestidade estatística sem usar termos de "previsão" ou "probabilidade de acerto" (exceto para negar)
