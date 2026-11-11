# Design System v2 "brasa": cópia de referência

> **Somente leitura.** Esta pasta é uma cópia fiel do artefato do DS, para que agentes e subagentes leiam os arquivos direto do repositório. Não edite aqui: mudanças no DS são feitas no artefato e depois a cópia é atualizada inteira.

- **Fonte:** https://claude.ai/artifact/9TAdTj4LkKjQRPiaVbH9XK (versão publicada `1794382947-2aa6`, conteúdo do DS de 09/11/2026, nota "v2 'brasa'").
- **Copiado em:** 11/11/2026, todos os arquivos de `project/` do artefato (88 arquivos).
- **Em conflito**, vale o artefato; se a cópia estiver desatualizada, atualize-a e registre a nova versão aqui.

## Por onde começar

| Arquivo | O que tem |
|---|---|
| `README.md` | Brand book: princípios, tom, linguagem "brasa", cor, tipografia, espaçamento, elevação, iconografia, mapa de valores antigos para tokens |
| `tokens.json` | Todos os tokens: cor (claro/escuro), tipo, espaçamento, raio, sombra, layout, duração, curva, efeito |
| `flutter.md` | Tradução para `app/lib/core/theme` (`AppColors`, `AppSpacing`, `AppRadius`, `AppShadows`, `AppMotion`, `AppLayout`, `AppTextStyles`) |
| `motion.md` | Movimento: assinatura acender/esfriar/pulsar, catálogo, reduzir movimento |
| `responsive.md` | Classes compact/medium/wide, navegação, áreas seguras, estados de rede |
| `tasks-and-focus.md` | Modelo de objetivos, atividades, passos e Foco |
| `components/<Nome>/README.md` + `preview.html` | Diretrizes e prévia de cada componente e tela (`Screen*`) |
| `kit/lume.css` | Kit web da linguagem (referência para as prévias) |
| `fonts/` | Inter 400 a 800 (.ttf) |

As prévias HTML carregam `tokens.css`, que o artefato gera a partir de `tokens.json`; abertas localmente, podem aparecer sem estilo. Para ver a prévia renderizada, use o artefato.
