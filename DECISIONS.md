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

---

## 2026-08-19 (Sprint 16.5 — Desbloqueio de conversão + Analytics)

Decisão:

A auditoria comercial final (Finalization 001) identificou um bloqueador P0: nenhum CTA do site levava a um canal de contato real — o botão "Solicitar orçamento" do CTA final apontava para `#contato`, ou seja, para a própria seção onde ele mora. Corrigido: Navbar, Final CTA e Footer agora abrem WhatsApp real (`https://wa.me/5527981122262`, com mensagem pré-preenchida via `?text=`) em nova aba (`target="_blank" rel="noopener noreferrer"`). Footer também ganhou `mailto:sou.andrades@gmail.com` real. `lib/contact.ts` centraliza os dois valores para evitar divergência entre os três pontos de uso.

Motivo:

Dados de contato autorizados explicitamente pelo Gabriel Studio nesta Sprint. Centralizar em `lib/contact.ts` (em vez de repetir a URL codificada em 3 arquivos) evita que uma futura alteração do número/e-mail precise ser feita em múltiplos lugares e evite divergência acidental.

---

### LinkedIn/GitHub removidos do Footer (não substituídos)

Decisão:

Os itens "LinkedIn" e "GitHub" do Footer foram removidos — não receberam URL nenhuma, real ou provisória.

Motivo:

Instrução explícita: nenhum perfil real foi definido para esses dois canais nesta Sprint, e a alternativa (inventar uma URL) violaria a regra permanente do projeto de nunca fabricar destino. Um elemento clicável sem destino real é pior que a ausência do elemento — a coluna "Contato" do Footer agora lista apenas os dois canais genuinamente utilizáveis.

---

### `Footer` virou Client Component

Decisão:

`components/sections/footer.tsx` ganhou `"use client"` — deixou de ser Server Component.

Motivo:

Necessidade real e nova: os links de WhatsApp/E-mail agora disparam `track()` (Vercel Analytics) em `onClick`, o que exige um Client Component. Antes desta Sprint o Footer não tinha nenhum estado/interação e por isso era corretamente um Server Component — a mudança é consequência direta de um requisito novo, não uma reversão de uma decisão anterior por conveniência.

---

### Vercel Web Analytics — `@vercel/analytics`

Decisão:

Instalado `@vercel/analytics` (única dependência nova desta Sprint). `<Analytics />` (de `@vercel/analytics/next`) adicionado ao `RootLayout`, dentro de `<body>`, fora do `ThemeProvider`. `track()` (do pacote base `@vercel/analytics`) chamado em 4 eventos: `contact_whatsapp_navbar`, `contact_whatsapp_final_cta`, `contact_whatsapp_footer`, `contact_email_footer` — nenhuma propriedade de evento além do nome (sem telefone, e-mail ou texto).

`npm install` reportou 1 vulnerabilidade "high" transitiva (`nanoid`, DoS teórico só explorável com `customAlphabet(alphabet, 0)` — não é um padrão de uso presente em `@vercel/analytics`). Resolvida via `npm audit fix` antes de prosseguir — `npm audit` limpo.

Motivo:

`/next` é o entry point oficial da Vercel para Next.js App Router (confirmado via `.d.ts` do pacote instalado antes de escrever código — mesma disciplina de nunca assumir uma API sem checar o pacote real). Nenhum outro analytics (GA, Meta Pixel, Hotjar, Clarity) foi adicionado — instrução explícita de usar somente Vercel Web Analytics nesta Sprint, sem cookie próprio nem banner de consentimento artificial.

Localmente (`next start`, fora da infraestrutura da Vercel), o script `/_vercel/insights/script.js` retorna 404 — comportamento esperado: esse endpoint só existe quando servido pela própria Vercel em produção. Confirmado que o `<Analytics />` injeta a tag `<script>` corretamente no HTML; a coleta de dados real só é validável após o deploy.
