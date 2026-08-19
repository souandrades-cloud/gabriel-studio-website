# DECISIONS.md

Diário de decisões importantes do projeto. Registra o contexto por trás de escolhas de arquitetura, escopo e processo — pra nunca mais precisar se perguntar "por que fizemos isso desse jeito?". Nunca remover histórico; decisões revertidas ganham uma entrada nova explicando a mudança, a antiga continua registrada.

## 2026-08-04

Decisão:

O site da Gabriel Studio será o Template Base da empresa.

Motivo:

Reduzir tempo de desenvolvimento dos futuros clientes.

---

## 2026-08-04

Decisão:

Utilizar apenas componentes reutilizáveis.

Motivo:

Facilitar manutenção e escalabilidade.

---

## 2026-08-10

Decisão:

Na Sprint 16 (V3 — direção visual escura), seções específicas (Hero, Navbar, Processo, Projetos, Tecnologias, Sobre, CTA Final, Footer) recebem atmosfera escura aplicando a classe `.dark` já existente diretamente no wrapper da seção, em vez de criar tokens semânticos novos (`surface-dark`, etc).

Motivo:

O projeto já tinha um conjunto completo de tokens `.dark` definido em `globals.css` desde a Sprint 01 (preparado para um futuro toggle de tema), nunca utilizado. Como os tokens são CSS custom properties, aplicar `.dark` num wrapper faz cascade automático para toda a subárvore — os componentes do design system (Button, Badge, Heading) já respondem corretamente sem nenhuma alteração. Isso evita duplicar o sistema de cores e mantém uma única fonte de verdade para "modo escuro", seja ele o tema inteiro (futuro) ou uma seção isolada (hoje).

---

## 2026-08-18

Decisão:

Na Sprint 16.2, Atlas e o "Dashboard de Prospecção" (FIS) foram removidos da apresentação pública do Gabriel Studio Sites (`components/sections/projects.tsx`). A seção `#projetos` foi reconstruída para ter como conteúdo central o `LandingPagesShowcase` (Cora, Toledo Prado, Vão, Lume + 2 placeholders conceituais), precedido apenas por um título/intro da seção. Os cards "Gabriel Estúdio Website" e "Seu próximo projeto" também foram removidos. Os assets órfãos `public/images/projects/atlas.png` e `fis-dashboard.png` foram apagados (confirmado, via busca, que não tinham nenhum outro consumidor no código).

Motivo:

Atlas e FIS são produtos internos ainda "Em desenvolvimento" — não são cases demonstráveis. Auditoria da Sprint 16/V3 constatou que a seção antiga (~2244px de altura, quase 3× as demais seções) misturava dois portfólios conceitualmente distintos e subordinava visualmente as landing pages reais (os únicos cases finalizados e publicados do portfólio) a produtos ainda incompletos. O card "Gabriel Estúdio Website" foi removido pela mesma razão: é uma referência autoral/meta (o próprio site que o visitante já está navegando), não um case externo demonstrável, e seu status "Em desenvolvimento" — verdadeiro para esta V3, mas não para a V1 já publicada — geraria uma leitura confusa dentro de uma seção agora dedicada a cases finalizados. O card "Seu próximo projeto" foi removido por redundância objetiva com a seção CTA Final (`#contato`), que já contém uma chamada de conversão dedicada e mais forte ("Solicitar orçamento" + "Ver projetos") — mantê-lo como um card secundário dentro de Projetos duplicava essa função sem agregar informação nova.

Atlas e FIS continuam existindo normalmente em seus próprios diretórios (`D:\Project-Atlas`, `C:\Users\Gabriel\Desktop\gabriel-studio\fis`) — apenas as referências na home foram removidas.

Resultado mensurado: altura de `#projetos` em 1440px caiu de 2244px para 1174px (~48% de redução), sem comprimir artificialmente o showcase — o LandingPagesShowcase (cards, marquee, scroll mobile, reduced-motion, proporção 16:10) não foi redesenhado, apenas reposicionado como conteúdo principal da seção.

---

## 2026-08-18 (Sprint 16.4 — Fechamento V3)

Decisão:

V3 aprovada para produção após auditoria completa (Sprint 16.3 — READY FOR CLOSURE, zero bloqueante/importante) e publicada em produção no projeto Vercel já existente (`gabriel-studio-website`).

Motivo:

Navbar mobile corrigida (16.1), Footer semanticamente corrigido (16.1), Atlas/FIS removidos da vitrine pública e Projetos reconstruída em torno do showcase de landing pages (16.2), auditoria full-page sem achados bloqueantes (16.3). Não havia razão para adiar o fechamento.

Os links de contato do Footer (WhatsApp, E-mail, LinkedIn, GitHub) permanecem `href="#"` — placeholders deliberados desde a Sprint 11, pois os destinos reais não estão documentados no projeto. Isso não bloqueia esta publicação; fica registrado como pendência para quando os destinos reais forem definidos.
