# Lume 🔥

Organizador visual de objetivos e rotina diária — um "quadro de horários da escola" vivo, feito para ficar **aberto o dia todo** num tablet ou monitor na parede da casa (modo Painel ambiente).

- **Painel** (`/`): atividade atual gigante com tempo restante, próxima atividade, timeline do dia, progresso do dia e por objetivo, e a chama da sequência.
- **Grade** (`/grade`): blocos recorrentes por dia da semana, vinculados a um objetivo ou "Obrigatória".
- **Objetivos** (`/objetivos`): objetivos fragmentados em etapas + backup (export/import JSON).

Documentação de visão, negócio e decisões: [lume-knowledge-base](https://github.com/Felipe678/lume-knowledge-base).

## Rodar

```bash
npm install
npm run dev    # http://localhost:5173
npm test       # testes do domínio (Vitest)
npm run build  # produção + PWA
```

Em desenvolvimento há um controle de **time travel** (botão de relógio no canto inferior esquerdo) para simular qualquer dia/horário — é assim que se testa um app que vive o dia inteiro.

## Stack

React 19 + Vite + TypeScript · Zustand (persist/localStorage) · Tailwind CSS v4 · react-router · vite-plugin-pwa · Vitest.

## Notas de arquitetura

- A grade é a fonte da verdade da recorrência; as atividades do dia são **derivadas** em memória. Só o check-in é persistido (`"AAAA-MM-DD:blockId"`).
- Blocos usam intervalo semiaberto `[início, fim)` e não cruzam a meia-noite.
- Streak: dia sem blocos agendados é neutro (não quebra); hoje vazio não zera até a meia-noite.
- Datas sempre no fuso local; fonte única de "agora" (tick de 10s + `visibilitychange`).
- Um dispositivo-painel é a fonte da verdade no MVP (sem sync entre dispositivos; entre abas do mesmo navegador há re-hidratação via evento `storage`).
