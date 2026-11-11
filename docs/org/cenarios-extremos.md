# Checklist de cenários extremos

> Usado pelo `dev-edge-cases` em toda tarefa. Não é para aplicar tudo: escolha o que tem caminho plausível na tarefa. Todo cenário que aconteceu de verdade vira uma linha aqui.

## Dados e valores
- Zero, negativo, vazio, nulo, só espaços, texto enorme, emoji, acentos e normalização (NFC/NFD).
- Dinheiro: centavos, divisão que não fecha, soma de partes ≠ total, `R$ 1.234,56` digitado com ponto ou vírgula, valores negativos (estorno).
- Saúde: peso e IMC com altura zero ou ausente, medidas fora de faixa plausível, dose registrada fora do padrão (o app registra, nunca corrige nem recomenda), aplicação duplicada no mesmo horário.
- Lista com um item, com milhares de itens, ordem inesperada, duplicados.

## Tempo e datas
- Virada de dia, mês e ano; 29/02; último dia do período; fim de semana e feriado.
- Atividade que cruza a meia-noite; início incluso e fim excluso; duração zero ou negativa; blocos sobrepostos.
- Fuso: servidor em UTC × usuário em `America/Sao_Paulo`; relógio do aparelho errado; app aberto o dia todo passando da meia-noite (o card "Agora" atualiza a cada 30 s).
- Tarefa agendada que perdeu a janela (workflow n8n ou servidor fora do ar na hora).

## Concorrência, offline e sync
- Dois dispositivos editando o mesmo registro; duas abas; dois cliques.
- Sync por módulo ou registro: conflito num módulo **nunca** descarta mudança de outro.
- Ação repetida (retry, reenvio): idempotente. Processo interrompido no meio. Ordem de eventos trocada.
- Offline e volta; migração de versão com dados antigos do app React.

## Integrações e infraestrutura
- Serviço externo lento, fora do ar, resposta inválida, mudou de formato, limite de requisições.
- Webhook do n8n duplicado, atrasado, fora de ordem ou sem `X-Lume-Token` válido; n8n fora do ar (a tarefa não pode travar).
- Credencial expirada; disco cheio; PostgreSQL indisponível; backup que não restaura.

## Interface e Design System v2 "brasa"
- Três classes de tela (compact, medium, wide), de 320 px a desktop; fonte ampliada (1,3×); tema claro e escuro.
- `disableAnimations` ligado: nada pode depender de animação para fazer sentido.
- Estados padrão: carregando, vazio, erro, sem conexão, dia concluído, sem rotina.
- Contraste mínimo nos dois temas; foco por teclado visível; leitor de tela.
- Mais de uma fonte de luz na tela, ou brilho em elemento que não está acontecendo agora (violação do DS).

## IA e automações
- Pedido de dose, ajuste de dose ou "posso tomar mais?": a IA recusa e orienta procurar o profissional, sem número.
- Prompt injection vindo de texto do usuário, de anotação ou de documento; pedido de dados de outra pessoa.
- IA inventando informação; resposta fora do formato; custo de tokens fora do teto; loop entre automações.
- Texto da IA com culpa, comparação, pressão ou gatilho de vício (viola o tom pró-humano).
- Dado de saúde indo para prompt, log ou serviço externo sem consentimento explícito.

## Segurança e privacidade (LGPD)
- Acesso por URL ou UUID de outro usuário (IDOR); token expirado ou de outro ambiente.
- Titular pedindo exportação ou exclusão; consentimento revogado; soft delete × direito ao apagamento.
- Dado de saúde ou documento em log, mensagem de erro, URL ou exportação; documento fora do armazenamento criptografado.

## Pessoas e operação
- Uso no celular com tela pequena; usuário que nunca leu instrução; acessibilidade.
- Usuário em extremos (conforto demais ou pressão extrema): o app sugere o caminho do meio, nunca pune.
- Restauração de backup; erro humano na configuração do `.env` ou do n8n.
