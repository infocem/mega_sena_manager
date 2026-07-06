# Guia do Usuário — Mega-Sena Manager

Este guia explica como usar o Mega-Sena Manager para visualizar o histórico de concursos da Mega-Sena, analisar estatísticas e gerar jogos sugeridos. O objetivo é oferecer uma ferramenta transparente de consulta e seleção de dezenas.

## Sumário

- [Glossário](#glossário)
- [Dashboard Estatístico](#dashboard-estatístico)
- [Gerador de Jogos](#gerador-de-jogos)
- [Filtros Estruturais](#filtros-estruturais)
- [Perguntas Frequentes](#perguntas-frequentes)
- [Aviso Legal](#aviso-legal)

**Aviso de honestidade estatística.** A Mega-Sena é um sorteio aleatório de variáveis independentes. **Nenhuma análise aumenta a probabilidade real de acerto** (~1 em 50 milhões por jogo de 6 dezenas). Estes jogos são uma *estratégia de seleção/diversificação transparente*, não uma previsão.

## Glossário

### Concurso

Cada sorteio oficial da Mega-Sena, identificado por um número sequencial. Um concurso contém a data do sorteio e as seis dezenas sorteadas.

### Dezena

Cada um dos números de 01 a 60 que podem ser sorteados na Mega-Sena. Um jogo válido contém exatamente 6 dezenas distintas.

### Volante

A cartela física de aposta da Mega-Sena, organizada em 10 linhas com 6 colunas cada. As dezenas são distribuídas sequencialmente: a primeira linha contém 01 a 06, a segunda 07 a 12, e assim por diante até a décima linha (55 a 60).

### Frequência

Quantas vezes uma dezena apareceu nos concursos analisados. Uma dezena com frequência alta saiu muitas vezes no período escolhido; uma com frequência baixa saiu poucas vezes.

### Atraso (Dezenas Atrasadas)

Número de concursos decorridos desde a última vez que uma dezena foi sorteada. Se a dezena 10 saiu no concurso 2800 e o concurso atual é o 2810, o atraso dela é 10. Dezenas com atraso alto são chamadas de "atrasadas".

### Janela de Análise

O intervalo de concursos usado para calcular as estatísticas. Você pode escolher analisar os últimos 50, 100, 500 concursos ou todos os concursos disponíveis. Janelas menores refletem tendências recentes; janelas maiores dão uma visão histórica completa.

### Quentes (Dezenas Quentes)

Dezenas que apareceram com mais frequência na janela de análise selecionada. São consideradas "quentes" por terem saído repetidamente no período observado, embora isso não aumente a chance de serem sorteadas novamente.

### Soma

A soma dos valores das seis dezenas de um jogo. Por exemplo, o jogo 05-12-23-34-45-56 tem soma 175. A soma ajuda a avaliar se um jogo está equilibrado, já que somas muito baixas ou muito altas são estatisticamente menos comuns.

### Par e Ímpar

A contagem de números pares e ímpares em um jogo. Um jogo com 3 pares e 3 ímpares é considerado equilibrado. Jogos com todos os números pares ou todos ímpares são possíveis, mas ocorrem com menos frequência nos sorteios.

### Espalhamento

Mede como as dezenas de um jogo se distribuem pelos grupos de 10 números do volante: 01-10, 11-20, 21-30, 31-40, 41-50 e 51-60. Um bom espalhamento significa que as dezenas estão espalhadas por vários grupos diferentes, em vez de concentradas em apenas um ou dois.

### Filtros Estruturais

Regras que um jogo sugerido precisa respeitar para ser considerado válido. Os filtros verificam: quantidade de dezenas pares e ímpares, faixa aceitável para a soma das dezenas, limite de dezenas sequenciais (como 23-24) e espalhamento mínimo entre os grupos de 10.

### Seed do Gerador

Um número que controla o gerador aleatório interno. Com a mesma seed do gerador, o gerador produz exatamente os mesmos jogos, o que permite reproduzir resultados. Seeds diferentes produzem jogos diferentes. Isso é útil para testes e para repetir uma geração que você gostou.

### Seed de Dados

O arquivo JSON (`megasena-seed.json`) que contém o histórico completo de concursos da Mega-Sena versionado no repositório. Essa seed de dados é a base de fábrica usada para popular o app na primeira execução, antes que o cache do navegador seja construído.

### Relaxamento

Processo automático que afrouxa os filtros estruturais de forma progressiva quando o gerador não consegue encontrar jogos que atendam a todos os critérios originais. Se nenhum candidato passa nos filtros rígidos, os limites são suavizados passo a passo até que jogos válidos sejam encontrados.

### Critério

O rótulo que indica a estratégia usada para gerar cada jogo: **Quentes** (prioriza dezenas que saíram mais vezes), **Atrasadas** (prioriza dezenas que não saem há mais concursos), **Aleatório** (seleção sem viés estatístico) ou **Misto** (combinação das estratégias). Cada jogo gerado exibe seu critério para transparência.

## Dashboard Estatístico

O Dashboard reúne quatro painéis visuais que descrevem o comportamento passado dos sorteios. Ele **não prevê resultados futuros** — apenas mostra o que já aconteceu nos concursos selecionados pela janela de análise.

### Seletor de Janela

No topo do Dashboard, botões permitem escolher quantos concursos recentes entram no cálculo de todas as estatísticas: **50**, **100**, **500** ou **Tudo** (todos os concursos disponíveis).

Janelas menores (50, 100) refletem tendências recentes. Janelas maiores (500, Tudo) dão uma visão histórica completa. A escolha da janela afeta todos os quatro painéis ao mesmo tempo.

### Frequência por Dezena

Gráfico de barras que mostra quantas vezes cada dezena (01 a 60) foi sorteada na janela selecionada.

- **Eixo horizontal**: as 60 dezenas, de 01 a 60.
- **Eixo vertical**: número de aparições.
- Barras mais altas indicam dezenas que saíram mais vezes no período.

Este painel é puramente descritivo. Uma dezena com frequência alta não tem maior chance de sair no próximo sorteio.

### Distribuição Par/Ímpar

Gráfico de barras que agrupa os concursos pela combinação de números pares e ímpares em cada sorteio. As sete categorias possíveis são:

- **0P/6Í** — todos os números são ímpares
- **1P/5Í** — um par e cinco ímpares
- **2P/4Í** — dois pares e quatro ímpares
- **3P/3Í** — três pares e três ímpares
- **4P/2Í** — quatro pares e dois ímpares
- **5P/1Í** — cinco pares e um ímpar
- **6P/0Í** — todos os números são pares

A barra correspondente a **3 pares + 3 ímpares** aparece em cor diferente para destacar o equilíbrio, que é a combinação mais frequente nos sorteios.

### Maiores Atrasos

Tabela com as **12 dezenas que mais tempo ficaram sem ser sorteadas** na janela selecionada. Não exibe todas as 60 dezenas, apenas as que estão com o maior "tempo de espera".

- **Coluna Dezena**: o número da dezena (formato 01 a 60).
- **Coluna Atraso**: quantos concursos se passaram desde a última vez que essa dezena saiu.

A tabela é ordenada do maior atraso para o menor. Uma dezena com atraso zero significa que ela saiu no concurso mais recente.

### Soma das Dezenas

Painel que apresenta seis estatísticas sobre a soma dos valores das seis dezenas de cada concurso:

- **Mínima**: a menor soma já registrada na janela.
- **Percentil 10**: valor abaixo do qual ficam 10 % das somas.
- **Média**: soma média de todos os concursos na janela.
- **Mediana**: o valor central — metade das somas fica acima, metade abaixo.
- **Percentil 90**: valor acima do qual ficam apenas 10 % das somas.
- **Máxima**: a maior soma já registrada na janela.

A faixa entre o **Percentil 10** e o **Percentil 90** representa a zona típica onde a maioria das somas se concentra. Somas fora dessa faixa (muito baixas ou muito altas) são estatisticamente mais raras.

**Conexão com o gerador**: essa faixa típica (p10–p90) é usada como filtro do gerador de jogos. Ou seja, os jogos sugeridos são construídos para que a soma das dezenas fique dentro desse intervalo, evitando combinações extremas que raramente ocorrem nos sorteios.

## Gerador de Jogos

O Gerador de Jogos combina as estatísticas do Dashboard com um gerador aleatório determinístico (PRNG) para produzir jogos sugeridos. Cada jogo passa por filtros estruturais antes de ser exibido, garantindo combinações equilibradas.

### Pesos de Seleção

Três sliders controlam a estratégia de seleção das dezenas. Cada um varia de **0 a 100** e os valores são relativos: o que importa é a proporção entre eles, não o valor absoluto.

**Valores iniciais: Quentes 40, Atrasadas 40, Aleatório 20.** Os pesos não são iguais. Há uma leve prioridade para dezenas quentes e atrasadas em relação à seleção puramente aleatória.

- **Quentes** — prioriza dezenas que apareceram mais vezes na janela de análise selecionada. Quanto maior o peso, mais o gerador favorece dezenas com alta frequência.
- **Atrasadas** — prioriza dezenas que não são sorteadas há mais concursos. Quanto maior o peso, mais o gerador favorece dezenas com maior atraso.
- **Aleatório** — distribuição uniforme: todas as 60 dezenas têm a mesma chance de serem selecionadas, independentemente das estatísticas.

Você pode ajustar cada slider independentemente. Colocar um peso em zero remove completamente aquela estratégia da mistura. Colocar os três em valores iguais (por exemplo, 50/50/50) resulta em uma combinação equilibrada das três abordagens.

### Quantidade de Jogos

O campo numérico define quantos jogos serão gerados de uma vez. O intervalo vai de **1 a 20**, com valor padrão de **5 jogos**. Cada jogo gerado é único dentro da mesma geração, sem repetições de dezenas entre eles.

### Botão Regenerar

O botão **Regenerar** altera a seed interna do gerador e produz um novo conjunto de jogos, mantendo os mesmos pesos e quantidade configurados. É útil para explorar combinações diferentes sem precisar ajustar os controles novamente. Como o gerador é determinístico, a mesma seed sempre produz os mesmos jogos.

### Formato de Cada Jogo

Cada jogo sugerido é exibido com três elementos:

1. **6 bolas numeradas** — as dezenas em ordem crescente, formatadas com dois dígitos (01 a 60).
2. **Rótulo do critério** — indica a estratégia dominante na geração daquele jogo: **Quentes**, **Atrasadas**, **Aleatório** ou **Misto**. O critério é determinado pelo peso mais alto na configuração atual. Quando dois ou mais pesos empatam no valor máximo, o critério é classificado como **Misto**.
3. **Texto explicativo** — descreve a estratégia aplicada e os filtros estruturais que o jogo respeitou (faixa de soma, equilíbrio par/ímpar, limite de sequenciais e espalhamento mínimo).

### Aviso de Honestidade

O aviso de honestidade estatística aparece no topo da seção de jogos sugeridos e deve ser levado a sério. **Nenhuma estratégia de seleção aumenta a probabilidade real de acerto.** A chance de um jogo de 6 dezenas premiar na Mega-Sena é de aproximadamente **1 em 50 milhões**, independentemente de como as dezenas foram escolhidas.

Os jogos gerados são uma **estratégia de diversificação transparente**, não uma previsão. Os filtros estruturais apenas eliminam combinações estatisticamente atípicas (como somas extremas ou dezenas concentradas em uma única linha do volante), mas não alteram a probabilidade fundamental do sorteio.

## Filtros Estruturais

Todo jogo sugerido passa por quatro filtros antes de ser exibido. Esses filtros são **regras de diversificação**, não de previsão. Eles eliminam combinações estatisticamente atípicas para que os jogos gerados se pareçam com a maioria dos sorteios históricos, mas **não aumentam a chance real de premiação**.

### Par/Ímpar

Cada jogo deve conter entre **2 e 4 dezenas pares** (e, consequentemente, entre 2 e 4 ímpares).

Jogos com 6 pares ou 6 ímpares são rejeitados. No histórico da Mega-Sena, combinações extremas como essas são raras. O filtro garante que o jogo fique nas faixas mais comuns: 2P/4Í, 3P/3Í ou 4P/2Í.

### Soma na Faixa

A soma das 6 dezenas deve estar entre o **percentil 10** e o **percentil 90** das somas observadas no histórico analisado.

Essa faixa é **derivada dos dados**, não é um valor fixo. Por exemplo, se o percentil 10 for 120 e o percentil 90 for 220, a soma do jogo deve ficar entre 120 e 220. Somas muito baixas (como 01+02+03+04+05+06 = 21) ou muito altas (como 55+56+57+58+59+60 = 345) são rejeitadas por estarem fora da zona típica dos sorteios.

### Sem Sequenciais Longos

No máximo **3 dezenas consecutivas** são aceitas em um jogo. Sequências de 4 ou mais dezenas em ordem são rejeitadas.

Exemplo: o jogo contendo 23-24-25 é aceito (3 consecutivas). O jogo contendo 23-24-25-26 é rejeitado (4 consecutivas). Sequências longas são incomuns nos sorteios reais e o filtro as elimina.

### Espalhamento

As dezenas do jogo devem estar distribuídas em pelo menos **3 grupos distintos** do volante. Cada grupo é uma faixa de 10 números:

| Grupo | Faixa |
|-------|-------|
| 1 | 01–10 |
| 2 | 11–20 |
| 3 | 21–30 |
| 4 | 31–40 |
| 5 | 41–50 |
| 6 | 51–60 |

Exemplo: um jogo com dezenas 05, 15, 25, 35, 45, 55 tem espalhamento 6 (ocupa todos os grupos). Um jogo com dezenas 01, 02, 03, 04, 05, 06 tem espalhamento 1 (todas no grupo 01–10) e é **rejeitado** por não atingir o mínimo de 3 grupos.

### Relaxamento Progressivo

Se o gerador não encontra candidatos válidos após **200 tentativas** em um nível de filtragem, ele relaxa os filtros progressivamente. Isso evita que o gerador falhe silenciosamente quando a combinação de pesos e filtros produz um espaço de busca muito restrito.

A ordem de relaxamento é fixa:

| Nível | Filtros ativos | Filtros desativados |
|-------|---------------|---------------------|
| 0 | Todos | Nenhum |
| 1 | Soma, Sequenciais, Par/Ímpar | Espalhamento |
| 2 | Sequenciais, Par/Ímpar | Espalhamento, Soma |
| 3 | Par/Ímpar | Espalhamento, Soma, Sequenciais |
| 4 | Nenhum (só validade básica) | Todos |

Quando o relaxamento ocorre, o jogo exibe a mensagem: **"alguns filtros foram relaxados por escassez de candidatos válidos"**. Isso indica que o gerador precisou afrouxar critérios para encontrar uma combinação válida, mas o jogo ainda respeita a estrutura básica de 6 dezenas distintas entre 01 e 60.

## Perguntas Frequentes

### As estatísticas aumentam minha chance de ganhar?

Não. A Mega-Sena é um sorteio aleatório de variáveis independentes. Cada combinação de 6 dezenas tem a mesma probabilidade de ser sorteada: aproximadamente 1 em 50 milhões. As estatísticas apenas descrevem o que aconteceu no passado. Elas não preveem o futuro.

### O que são dezenas atrasadas?

São dezenas que não são sorteadas há muitos concursos. O "atraso" de uma dezena é o número de concursos desde a última vez que ela apareceu. Por exemplo, se a dezena 10 não sai há 30 concursos, seu atraso é 30. Dezenas atrasadas não têm maior chance de sair. Cada sorteio é independente.

### O que significa o critério "Misto"?

Significa que os pesos de Quentes, Atrasadas e Aleatório estão equilibrados, sem que nenhum deles domine. Quando dois ou mais pesos empatam no valor máximo, o critério é classificado como "Misto". Isso indica uma combinação das três estratégias.

### Por que alguns jogos dizem que filtros foram relaxados?

O gerador aplica 4 filtros estruturais (par/ímpar, soma, sequenciais, espalhamento) para garantir combinações equilibradas. Se, após 200 tentativas, nenhum candidato válido for encontrado com todos os filtros ativos, o gerador relaxa progressivamente os filtros na ordem: espalhamento → soma → sequenciais → par/ímpar. A mensagem indica que o gerador precisou afrouxar critérios para encontrar uma combinação válida, mas o jogo ainda respeita a estrutura básica de 6 dezenas distintas.

### O que é a janela de análise?

É o número de concursos recentes usados para calcular as estatísticas. Você pode escolher 50, 100, 500 ou todos os concursos. Janelas menores refletem tendências recentes. Janelas maiores dão uma visão histórica completa. A escolha da janela afeta todos os painéis do Dashboard e os jogos gerados.

## Aviso Legal

O Mega-Sena Manager é uma ferramenta de **análise estatística descritiva e diversificação**. Ele organiza dados históricos de sorteios e oferece uma maneira transparente de selecionar dezenas com base em critérios definidos pelo usuário.

Este aplicativo **não é uma ferramenta de previsão**. A Mega-Sena é um sorteio aleatório regulado pela Caixa Econômica Federal. Nenhuma análise estatística, padrão histórico ou estratégia de seleção aumenta a probabilidade real de acerto. A chance de premiar com um jogo de 6 dezenas permanece em aproximadamente 1 em 50 milhões, independentemente do método utilizado.

Jogue com responsabilidade.
