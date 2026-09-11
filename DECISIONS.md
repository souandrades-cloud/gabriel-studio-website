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

---

## 2026-09-10 — X01 Migration Pilot 001 (V2 — Portfolio System)

Decisão:

O piloto de migração do X01 (Studio Showcase) para a arquitetura `/work/{slug}` + `/work/{slug}/experience` foi validado tecnicamente e visualmente pelo Gabriel Studio — Human Director e **aprovado como baseline arquitetural** para a migração dos demais Studio Showcases (X02, X03).

Arquitetura validada:

- Legacy: `/showcase/x01` (intocado, permanece funcional).
- Experience candidate: `/work/x01/experience` — cópia da implementação existente, mesmo padrão de root layout independente (sem Navbar institucional) já usado por `(showcase)` hoje. Único código de produção reaproveitado, nenhuma duplicação de árvore de componentes.
- Registry: X01 registrado em `data/projects/studio-showcases.ts` como `kind: "studio-showcase"`, `showcaseCode: "X01"`, `publication: "review"`, `visibility: "unlisted"` — mesmo modelo de fronteira pública (`isPubliclyVisible`) já usado pelos Standard Cases, sem nenhum campo novo no schema.
- `StudioShowcaseBody` criado (`components/portfolio/studio-showcase-body.tsx`) — genérico, mesmo padrão de dispatch por `project.kind` que `StandardCaseBody`, sem branching por slug.
- Fronteira pública confirmada intacta: `/work/x01` → 404, `/work` mostra apenas os 6 Standard Cases, sitemap não referencia `/work/x01` nem `/work/x01/experience`.
- Dual-run (legacy + nova rota simultaneamente ativas) permanece a estratégia ativa — nenhum redirect criado ainda.

Decisão específica sobre o self-link do wordmark: `components/showcase/x01/hero.tsx` é componente compartilhado entre a rota legada e a nova (não duplicado); o href do wordmark foi atualizado para `/work/x01/experience` e passou a valer para as duas rotas simultaneamente durante o dual-run. Isso foi avaliado e **aceito deliberadamente** pelo Human Director — duplicar a árvore de componentes só para preservar o href antigo violaria a regra de reutilização máxima do projeto, e o link permanece válido/navegável nos dois casos.

Motivo:

QA técnico (99/99 testes, typecheck, lint, format, registry validation, build, 31 rotas estáticas) e QA visual humano (Hero, narrativa de scroll, tipografia, Balance, Tension, Veil, Pendulum, Object Studies, imagens, macro/material studies, composição e continuidade geral) não encontraram nenhuma regressão. `document.body.innerText` capturado via CDP confirmou conteúdo byte-idêntico entre `/showcase/x01` e `/work/x01/experience`. Com o piloto aprovado, o padrão (`studio-showcases` registry → `StudioShowcaseBody` → `/work/{slug}/experience` isolada → fronteira `unlisted/review` → dual-run) passa a ser reutilizado como arquitetura-padrão para X02 e X03, evitando criar uma segunda arquitetura para cada showcase.

Nenhuma alteração de publicação: X01 continua `review`/`unlisted`. Nenhum redirect criado. Home e Navbar não tocados.

---

## 2026-09-10 — X02 Migration Pilot 001 (V2 — Portfolio System) — PASS / CLOSED

Decisão:

O piloto de migração do X02 (Studio Showcase, WebGL/React Three Fiber) para a arquitetura `/work/{slug}` + `/work/{slug}/experience` foi validado tecnicamente e visualmente pelo Gabriel Studio — Human Director e está **aprovado / encerrado (PASS / CLOSED)**.

Human QA:

PASS. Gabriel (Human Director) comparou diretamente `http://localhost:3000/showcase/x02` (legacy) e `http://localhost:3000/work/x02/experience` (nova rota) e considerou as duas rotas **perceptualmente iguais**.

Aprendizados arquiteturais validados por este piloto:

- A mesma arquitetura provada pelo X01 (DOM/motion) se aplica sem adaptação a um showcase estruturalmente diferente (WebGL/Canvas único via React Three Fiber) — `registry.ts`, `app/(site)/work/[slug]/page.tsx` e `StudioShowcaseBody` não precisaram de nenhuma alteração.
- Reutilização da experiência existente: `X02Experience` foi importado e renderizado verbatim na nova rota, sem cópia/fork do componente.
- Nenhuma duplicação da árvore WebGL: um único Canvas R3F, uma única implementação de cena/câmera/materiais/shadow rig, consumida pelas duas rotas.
- Equivalência legacy/new confirmada tanto tecnicamente (QA automatizado via CDP: zero fallback, zero `webglcontextlost`, zero erros/exceptions em 6 passagens desktop/mobile/reduced-motion; sequência de estados do modo reduced-motion byte-idêntica) quanto perceptualmente (Human QA acima).
- Compatibilidade total com o registry V2: X02 registrado em `data/projects/studio-showcases.ts` como `kind: "studio-showcase"`, `showcaseCode: "X02"`, `publication: "review"`, `visibility: "unlisted"`, `media: []` (nenhum thumbnail/OG criado ainda — decisão deliberada, não pendência esquecida).
- Fronteira de publicação (`isPubliclyVisible`) preservada intacta: `/work/x02` → 404, `/work` mostra apenas os mesmos 6 Standard Cases, sitemap não referencia `/work/x02` nem `/work/x02/experience`.
- Coexistência segura durante dual-run: `/showcase/x02` (legacy, intocado) e `/work/x02/experience` (nova) responderam simultaneamente durante todo o piloto, sem redirect.
- Metadata da nova rota mantida deliberadamente idêntica à legada (`robots: { index: false, follow: false }`, sem `canonical`) — divergência intencional do padrão do X01 (que usa `follow: true` + canonical), pois X02 permanece totalmente não-indexável até um futuro gate de publicação.

Continuam proibidos nesta fase (sem alteração de escopo):

- Publicação pública do X02 (`publication`/`visibility` permanecem `review`/`unlisted`).
- Remoção de `/showcase/x02`.
- Criação de redirect entre as rotas.
- Criação de thumbnail/OG image.
- Push e deploy.

Motivo:

Checkpoint técnico `41b4e6bec4dcfdb594b93e92fce76109e0a6e683` já continha QA completo (108/108 testes, typecheck, lint, build, registry validation, WebGL QA) sem nenhuma regressão de migração identificada — apenas avisos de console pré-existentes (deprecation do `THREE.Clock`, aviso do Framer Motion sobre reduced-motion) e um warning de precisão de shader não-reprodutível, presente numa única passagem e ausente da rota legada usando o mesmo shader, consistente com variação de compilação do driver e não com uma regressão causada pela rota. Com a confirmação perceptual humana, o segundo Studio Showcase da série está formalmente encerrado, reforçando — agora com uma tecnologia de renderização estruturalmente diferente da do X01 — que a arquitetura registry → `StudioShowcaseBody` → `/work/{slug}/experience` isolada → fronteira `unlisted/review` → dual-run é independente da tecnologia interna de cada showcase. X03 (WebGL + variantes `x03-lab`) fica autorizado para uma futura missão de discovery/pilot separada — não iniciado aqui.

---

## 2026-09-10 — X03 Migration Pilot 001 (V2 — Portfolio System) — PASS / CLOSED

Decisão:

O piloto de migração do X03 (Studio Showcase "Proprio — PL-1", híbrido imagem + WebGL/React Three Fiber) para a arquitetura `/work/{slug}` + `/work/{slug}/experience` foi validado tecnicamente e visualmente pelo Gabriel Studio — Human Director e está **aprovado / encerrado (PASS / CLOSED)**.

Human QA:

PASS. Gabriel (Human Director) comparou diretamente `http://localhost:3000/showcase/x03` (legacy) e `http://localhost:3000/work/x03/experience` (nova rota) e considerou as duas rotas **perceptualmente iguais**.

Aprendizados arquiteturais validados por este piloto:

- A arquitetura provada por X01 (DOM/motion) e X02 (canvas WebGL único) se aplica, sem nenhuma adaptação, a uma terceira classe de experiência: X03 intercala 4 seções baseadas em imagem (Hero, Material/Mechanism, Field Action, Hybrid Return) com 2 seções WebGL/R3F (Machine Signal, Machine Perception) dentro de uma única composição de página — `registry.ts`, `app/(site)/work/[slug]/page.tsx` e `StudioShowcaseBody` não precisaram de nenhuma alteração.
- Reutilização máxima: `app/(showcase)/work/x03/experience/page.tsx` é um reexport direto (`export { default } from ".../showcase/x03/page"`), zero cópia de JSX — forma ainda mais enxuta que X01 (JSX duplicado) e X02 (wrapper de um componente único), possível porque a página X03 não tem nenhuma lógica dependente de rota.
- Root-layout isolation preservada: layout independente sob `(showcase)`, sem herdar Navbar/chrome institucional, mesmo padrão de X01/X02.
- Zero fork da árvore visual: `components/showcase/x03/*` não sofreu nenhuma alteração; as duas rotas montam exatamente os mesmos componentes.
- Compatibilidade WebGL confirmada: QA automatizado via Playwright/Chromium headless — canvas monta com bounding box não-nulo nas duas rotas (desktop 1440×900, mobile 390×844), zero `pageErrors` em 6 passagens (legacy/new × desktop/mobile/reduced-motion), console idêntico entre as duas rotas (avisos pré-existentes e não-bloqueantes: deprecação do `THREE.Clock`, fallback de software WebGL do ambiente headless, aviso do próprio Framer Motion confirmando que `prefers-reduced-motion` foi detectado e respeitado nas duas rotas).
- Fronteira de publicação (`isPubliclyVisible`) preservada intacta: `/work/x03` → 404, `/work` continua mostrando apenas os 6 Standard Cases, sitemap não referencia `/work/x03` nem `/work/x03/experience`. `validate:registry` — "Registry válido, 9 projetos, zero issues."
- Metadata da nova rota mantida deliberadamente idêntica à legada (`robots: { index: false, follow: false }`, sem `canonical`) — segue o precedente X02, não o do X01, porque X03 permanece `review`/`unlisted`. Confirma X02 como o padrão correto daqui pra frente, não uma exceção isolada.
- Separação total entre produção e X03-Lab confirmada: zero import cruzado em qualquer direção entre `components/showcase/x03/*` e `components/showcase/x03-lab/*`. Nenhum WIP não commitado do worktree `main` (`x03-lab/field-action`, `field/consequence-*`, `continuous-*`, `reentry-*`, `final/`, `opening/`, `return/`) foi lido, promovido ou alterado — X03-Lab permanece inteiramente fora do escopo desta migração.
- Compatibilidade do contrato Studio Showcase confirmada em três classes de experiência estruturalmente distintas: X01 (DOM/motion), X02 (canvas WebGL único) e X03 (híbrido imagem + dois canvas WebGL independentes) — nenhuma delas exigiu extensão do schema do registry ou branching por slug em código compartilhado.

Continuam proibidos nesta fase (sem alteração de escopo):

- Publicação pública do X03 (`publication`/`visibility` permanecem `review`/`unlisted`).
- Remoção de `/showcase/x03`.
- Criação de redirect entre as rotas.
- Criação de thumbnail/OG image.
- Integração ao X03-Lab ou promoção do WIP do worktree `main`.
- Integração à Home/Navbar.
- Push e deploy.

Motivo:

Checkpoint técnico `7205a90ba624bcb3ad5970642e907fa30861fb4e` já continha QA completo (117/117 testes, typecheck, lint, format, build, registry validation, QA WebGL via browser real) sem nenhuma regressão de migração identificada. Com a confirmação perceptual humana, o terceiro e último Studio Showcase planejado da série está formalmente encerrado. Os três pilotos (X01, X02, X03) validam coletivamente que a arquitetura registry → `StudioShowcaseBody` → `/work/{slug}/experience` isolada → fronteira `unlisted/review` → dual-run é independente da tecnologia interna de cada showcase, encerrando o programa de migração-piloto dos Studio Showcases. Próximo gate (publicação, remoção de legacy, ou novo showcase) depende de decisão do Gabriel Studio — Mentor.

---

## 2026-09-10 — Studio Showcase Media Gate 001 (V2 — Portfolio System) — PASS / CLOSED

Decisão:

A curadoria e aquisição de mídia dos três Studio Showcases (X01, X02, X03) foi validada visualmente pelo Gabriel Studio — Human Director e está **aprovada / encerrada (PASS / CLOSED)**.

Human Media QA:

PASS nos três. Gabriel (Human Director) revisou o contrato de mídia final do checkpoint `16096cd24bb35a7f74a847d8739602a64cbb58f0`:

- **X01** → PASS — thumbnail atual (Balance) + gallery Veil/Pendulum/Pressure, sem nenhuma alteração de registry.
- **X02** → PASS — Surface (thumbnail) + Fracture/Resolution (gallery), **incluindo explicitamente a decisão curatorial de usar os captures sem o overlay DOM de headline/tagline/caption** (mantendo apenas os elementos visuais/composicionais da cena, como o `x02-seam-light`/`x02-panel` da cortina Surface).
- **X03** → PASS — PL-1 Master (thumbnail) + A-004/Field Commit/Final Signature (gallery).

Media contract final aprovado (sem alteração desde o checkpoint anterior):

- X01: `x01-a03-alternate.png` (thumbnail) + `X01-A04/A05/A06.png` (gallery) — inalterado; `x01-a01-monumental.png` e `x01-a02-isolated.png` permanecem fora do registry, decisão já registrada no gate anterior.
- X02: `x02-a001-surface.png` (thumbnail) + `x02-a002-fracture.png`/`x02-a003-resolution.png` (gallery) — 3 capturas determinísticas novas, aprovadas na forma atual.
- X03: `x03-a001-pl1-master.png` (thumbnail) + `A-004.png`/`x03-a008-field-commit.png`/`x03-a009-final-signature.png` (gallery) — wiring de assets já existentes.

Nenhuma regeneração ou recuradoria foi solicitada — o conjunto aprovado é definitivo até um futuro gate que o reabra explicitamente.

Fronteira de publicação (`isPubliclyVisible`) permanece intacta: `/work/x01`, `/work/x02`, `/work/x03` → 404; `/work/x01/experience`, `/work/x02/experience`, `/work/x03/experience` → 200; `/work` continua mostrando apenas os 6 Standard Cases; sitemap não referencia nenhum dos três showcases. Nenhum showcase foi publicado — `publication`/`visibility` permanecem `review`/`unlisted` nos três.

Continuam proibidos nesta fase (sem alteração de escopo):

- Publicação pública de X01/X02/X03.
- Alteração de `publication`/`visibility`.
- SEO Gate (canonical, `robots`, OG image) — permanece um gate futuro separado.
- Modificação de `StudioShowcaseBody`, `StandardCaseBody` ou `WorkProjectCard`.
- Remoção de legacy routes ou criação de redirects.
- Push e deploy.

Motivo:

Checkpoint técnico `16096cd24bb35a7f74a847d8739602a64cbb58f0` já continha QA completo (121/121 testes, typecheck, lint, format, registry validation, build) sem nenhuma regressão identificada, com fronteira de publicação reconfirmada via checagem HTTP ao vivo. Com a confirmação visual humana dos três contratos de mídia — incluindo a aprovação explícita da decisão de excluir o overlay DOM interativo dos captures do X02 — o Media Gate 001 está formalmente encerrado. Os três Studio Showcases agora possuem `media[]` completo e válido, pré-requisito para qualquer gate futuro de SEO/OG ou de publicação. Próximo gate depende de decisão do Gabriel Studio — Mentor.
