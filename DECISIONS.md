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

---

## 2026-09-11 — X01 Publication Pilot 001 (V2 — Portfolio System) — PASS / CLOSED

Decisão:

X01 (Studio Showcase) foi publicado publicamente através da arquitetura V2 existente — primeiro Studio Showcase a sair do estado `review`/`unlisted` para `published`/`public`. Validado tecnicamente e, em seguida, visualmente pelo Gabriel Studio — Human Director, está **aprovado / encerrado (PASS / CLOSED)**.

Mudança de registro:

Único campo funcional alterado em `data/projects/studio-showcases.ts`: X01 `publication: "review"` → `"published"`, `visibility: "unlisted"` → `"public"`. X02 e X03 não foram tocados — permanecem `review`/`unlisted`. Nenhum enum ou campo novo foi criado no schema (`lib/portfolio/types.ts`); o contrato `isPubliclyVisible` já suportava publicação desde os pilotos de migração.

Nenhum outro arquivo de produção precisou mudar: `/work` (listagem), `/work/[slug]` (resolução, `generateStaticParams`, `generateMetadata`, OG image), `getWorkProject`, `sitemap.ts` e `StudioShowcaseBody` já eram escritos genericamente contra a fronteira de publicação, sem branching por slug ou por `kind`. Apenas fixtures de teste que assumiam o estado antigo da fronteira foram atualizadas.

Resultado técnico (checkpoint `b0f9ee85fa46f8a057a66b125dd1393f5e88503a`):

- Fronteira de publicação resolve exatamente: `/work/x01` → 200, `/work/x02` → 404, `/work/x03` → 404; as três rotas `/work/{slug}/experience` permanecem 200 (alcançáveis tecnicamente ≠ publicadas).
- `/work` passa a listar os 6 Standard Cases + X01 (7 cards), ordem determinística preservada.
- `/work/x01` usa `StudioShowcaseBody` sem nenhuma alteração no componente; canonical `/work/x01`, sem `robots` explícito (indexável); OG image usa o asset aprovado (`x01-a03-alternate.png`, 1122×1402, dimensões reais do registry).
- `/work/x01/experience` mantém `robots: { index: false, follow: false }` — decoupling deliberado entre publicação da entry e indexabilidade da experience, conforme o gate de reconciliação de SEO já aplicado nos pilotos de migração.
- Sitemap passa a incluir `/work/x01`, mas nunca `/work/x01/experience`; X02/X03 e suas experiences continuam ausentes.
- Legacy `/showcase/x01` intocado e funcional; dual-run preservado, nenhum redirect criado.
- 137/137 testes, typecheck, lint, format e `validate:registry` ("9 projetos, zero issues") limpos; build de produção gerando 7 SSG paths sob `/work/[slug]`.

Human QA:

PASS. Gabriel (Human Director) revisou em browser real `/work` e `/work/x01`, incluindo card na grade, thumbnail, título, summary, capabilities, entry editorial, CTA "Ver experiência", integração com header/footer e comportamento visual geral. O tratamento visual atual de X01 dentro da grade `/work` é aceito como **baseline do piloto** — a grade não foi redesenhada.

Continuam proibidos nesta fase (sem alteração de escopo):

- Publicação pública de X02 ou X03 (`publication`/`visibility` permanecem `review`/`unlisted`).
- Redesign da grade `/work`.
- Remoção de `/showcase/x01` ou de qualquer rota legacy.
- Criação de redirects.
- Alteração das experiences (`/work/{slug}/experience`) ou de assets aprovados.
- Integração ao X03-Lab.
- Push e deploy.

Motivo:

QA técnico completo (testes, typecheck, lint, format, registry validation, build, checagem HTTP ao vivo da fronteira de publicação e da metadata) não encontrou nenhuma regressão nos 6 Standard Cases nem no dual-run legacy/nova rota. Com a confirmação visual humana, o primeiro Publication Pilot da série Studio Showcase está formalmente encerrado, provando que a arquitetura registry → fronteira de publicação (`isPubliclyVisible`) → `/work` → `/work/{slug}` → sitemap/SEO, já validada pelos Migration Pilots e pelo Media Gate 001, também suporta publicação real sem exigir nenhuma mudança estrutural — apenas a virada de dois campos no registro. A decisão sobre um eventual tratamento visual "premium" diferenciado para Studio Showcases dentro da grade `/work` permanece **futura** e não bloqueia este piloto. Próximo gate (X02 Publication Pilot, diferenciação visual, ou remoção de legacy) depende de decisão do Gabriel Studio — Mentor.

## 2026-09-23 — KOVA Commerce Showcase Integration 001 (V2 — Portfolio System)

Decisão:

KOVA (Portfolio Lab, projeto COMMERCE-001) foi integrado como o **quarto Studio Showcase** — primeiro cujo `kind: "studio-showcase"` não corresponde a uma experiência cinematográfica interna (GSAP/Three.js) com rota legada, mas a um showcase de e-commerce hospedado **fora deste repositório** (deploy isolado na Vercel: `https://kova-portfolio-lab.vercel.app`). Fonte de verdade: `Portfolio Lab/projects/commerce-001/INTEGRATION-HANDOFF.md` (commit `de71bc4` do Portfolio Lab) — metadata usada sem reinvenção.

Mudança de schema (motivo técnico real, não redesign):

O contrato existente (`StudioShowcaseProject.showcaseCode: "X01"|"X02"|"X03"` + `LEGACY_SHOWCASE_PATHS: Record<ShowcaseCode, string>` completo + invariante `showcase-published-without-legacy-path`) assume que todo Studio Showcase publicado tem uma rota interna `/showcase/x0N`. KOVA nunca terá essa rota — sua experiência real vive num deploy Next.js separado. Em vez de forçar KOVA num molde que não descreve a realidade (ou de rebaixá-lo a Standard Case, que o Mentor explicitamente vetou), o schema foi estendido:

- `ShowcaseCode` ganhou o literal `"KOVA"`.
- `LEGACY_SHOWCASE_PATHS` virou `Partial<Record<ShowcaseCode, string>>` — X01/X02/X03 inalterados, KOVA deliberadamente sem entrada (nunca terá).
- `StudioShowcaseProject` ganhou dois campos opcionais: `externalDestination?: ExternalDestination` (mesmo tipo já usado por `StandardCaseProject`) e `disclosure?: string` (mesmo papel do `disclosure` de Standard Case, mas opcional porque X01/X02/X03 são trabalho autoral, não uma simulação de projeto comercial — não precisam do rótulo).
- `validateProjectSelf`: um studio-showcase publicado agora é válido se tiver **ou** rota legada resolvível (X01/X02/X03), **ou** `externalDestination` com scheme http/https válido (KOVA) — nunca as duas coisas exigidas ao mesmo tempo, nunca nenhuma das duas.

X01/X02/X03 não mudaram nenhum campo, nenhum teste que os cobre mudou de comportamento — apenas ganharam uma dependência tipada nova (opcional) que eles não usam.

Renderização (`StudioShowcaseBody`, `ShowcaseStripCard`, `app/(site)/work/page.tsx`):

- `StudioShowcaseBody`: quando `disclosure` está presente, renderiza a mesma caixa de transparência conceitual já usada por `StandardCaseBody` (`Concept / Portfolio Showcase — ...`), visível na página de detalhe. Quando `externalDestination` está presente, o CTA final vira `<a target="_blank" rel="noopener noreferrer">` para a URL real em vez do `<Link>` interno para `/work/{slug}/experience` — mesmo padrão já usado por Standard Cases com destino externo. X01/X02/X03 não têm nenhum dos dois campos, então renderizam exatamente como antes.
- `ShowcaseStripCard` não mudou — já era genérico (thumbnail + título + summary + "Ver projeto" para `/work/{slug}`), funciona para KOVA sem alteração.
- Grid de Studio Showcases em `/work` (`app/(site)/work/page.tsx`): `sm:grid-cols-3` (dimensionado para exatamente 3 cards) virou `sm:grid-cols-2 lg:grid-cols-4` — com 4 showcases publicados agora, 3 colunas deixaria o 4º card órfão numa segunda linha. Único ajuste de layout desta gate; nenhum outro elemento de `/work` foi redesenhado.

Decisão deliberada de **não tocar na Home**: a seção "Signature" da Home (`components/sections/portfolio.tsx`) é uma composição curada e já aprovada pelo Human Director (X03 como hero via `SignatureFeature`, X02+X01 secundários), com o eyebrow "Trabalho autoral, conduzido sem as restrições de um projeto comercial." KOVA é estruturalmente o oposto disso — é precisamente uma demonstração de capability *comercial* (e-commerce). Inserir KOVA ali confundiria duas categorias que o próprio Gabriel Studio distingue e desfaria uma composição humana já validada, sem que o gate tivesse pedido isso (a missão pediu "camada destinada a Studio Showcases", que é a grade genérica de `/work`, não a curadoria manual da Home). KOVA aparece apenas em `/work` e `/work/kova` — Home permanece byte-a-byte como estava, exceto pela dependência de tipos compartilhada.

Asset:

`Portfolio Lab/projects/commerce-001/prototype-002/public/products/aero.png` (já aprovado, já em 16:9 — 1672×941 — sem necessidade de crop) foi copiado para `public/images/kova/kova-aero.png` deste repositório, seguindo o padrão existente de asset local por showcase (`public/images/x0{1,2,3}/`). Nenhum derivado novo foi gerado.

Resultado técnico:

- 160/160 testes (152 pré-existentes + 8 novos, cobrindo o schema estendido e a integração do KOVA), typecheck, lint e `validate:registry` ("10 projetos, zero issues") limpos.
- Build de produção gera `/work/kova` como SSG (10 paths sob `/work/[slug]`, contra 9 antes); nenhuma rota `/work/kova/experience` é criada (KOVA não usa `getTargetExperiencePath`).
- QA visual real (Playwright, produção local via `next start`) em 1440/820/390px: overflow horizontal 0px nas três larguras, card do KOVA renderiza corretamente na grade e na página de detalhe, disclosure "Concept / Portfolio Showcase" visível, CTA "Ver showcase" abre `https://kova-portfolio-lab.vercel.app` numa nova aba (`target="_blank" rel="noopener noreferrer"`) — confirmado via evento de popup real do browser, não apenas inspeção do HTML.
- Um 404 de console (`/_vercel/insights/script.js`) apareceu em todas as páginas testadas, incluindo a Home — confirmado como comportamento pré-existente do Vercel Web Analytics (só resolve em produção real na Vercel, não em `next start` local), não uma regressão desta gate.
- Um primeiro screenshot da página de detalhe do KOVA saiu com a imagem em branco logo após uma navegação client-side (clique no card) seguida de captura `fullPage` imediata — investigado via `naturalWidth`/`complete` do elemento `<img>`: a imagem carrega com sucesso (960px, `complete: true`) numa navegação direta com uma espera real. Mesma classe de artefato de captura já documentada em `Portfolio Lab/projects/commerce-001/PUBLICATION-001.md` §4 — não é um bug do site.

Continuam proibidos nesta gate (sem alteração de escopo):

- Redesign de `/work`, da Home ou de qualquer Standard Case.
- Qualquer alteração em X01/X02/X03 (código, dados, assets).
- Deploy do site principal — mudanças commitadas localmente, sem `git push`, sem deploy Vercel.
- Alteração do showcase KOVA em si (Portfolio Lab) — apenas leitura/cópia do asset aprovado.
- Criação de novas features além do necessário para representar corretamente um showcase externo no schema existente.

## 2026-09-23 — KOVA Integration Publication 001 (V2 — Portfolio System) — PASS / CLOSED

Decisão:

Publicado em produção o commit `662a130` (KOVA Commerce Showcase Integration 001, já validado localmente na gate anterior). Sem nenhuma mudança de código adicional — gate puramente mecânico de publicação + QA contra produção real.

Execução:

1. `git push origin v2/foundation` — fast-forward, `e142ec9..662a130`, sem conflito (branch local já estava exatamente em sincronia de conteúdo com `origin/v2/foundation` antes deste commit).
2. Confirmado que este projeto **não** tem deploy automático via push — não há GitHub Actions configurado, e todo o histórico de deploys de produção deste projeto (ver Sprints anteriores em `TASKS.md`) foi feito via `vercel --prod` a partir do CLI, não por integração Git nativa da Vercel. O push, portanto, apenas sincroniza o histórico remoto; não publica nada por si só.
3. `vercel --prod` executado a partir do checkout `v2/foundation` — deploy `dpl_Anxs89w1aRWvYbTyk3NAC3gqJNmF`, alias de produção atualizado para `https://gabriel-studio-website.vercel.app`. Ação sensível (produção real); bloqueada uma vez pelo classificador de segurança do ambiente ("Production Deploy"), retomada após autorização explícita do Gabriel via pergunta direta — mesmo padrão já usado na Publication 001 do KOVA (Portfolio Lab) para a desativação da proteção SSO da Vercel.

QA de produção (contra `https://gabriel-studio-website.vercel.app`, não localhost nem build local):

- Rotas: `/`, `/work`, `/work/kova`, `/work/x01`, `/work/x02`, `/work/x03` → todas `200`; HSTS presente.
- Asset `images/kova/kova-aero.png` → `200`.
- QA visual real via Playwright em 1440/820/390px: overflow horizontal 0px nas três larguras, tanto em `/work` quanto em `/work/kova`; card do KOVA e página de detalhe renderizam corretamente (disclosure "Concept / Portfolio Showcase" visível, capability tags, CTA); X01/X02/X03 sem nenhuma regressão visual.
- CTA "Ver showcase" clicado de verdade (não apenas inspecionado no HTML): abre uma nova aba real via evento de popup do browser, URL confirmada `https://kova-portfolio-lab.vercel.app/`.
- Console: zero erros/warnings em todas as páginas testadas (diferente do ambiente local via `next start`, onde o script do Vercel Web Analytics retornava 404 por não haver produção real por trás — em produção de verdade esse recurso resolve normalmente).

Resultado:

**PASS.** Publicação puramente mecânica de uma integração já validada — nenhum código adicional, nenhuma decisão arquitetural nova, nenhuma regressão encontrada. Home, Standard Cases e X01/X02/X03 permanecem intactos em produção. Encerra o ciclo de publicação do KOVA como Studio Showcase; próximos gates (se houver) dependem de nova autorização do Gabriel Studio — Mentor.

## 2026-09-23 — KOVA Website Integration Verification + Home Placement 001 (V2 — Portfolio System) — PASS / AGUARDANDO PUBLICAÇÃO

Decisão:

Fase 1 (verificação): estado real de produção conferido diretamente (HTTP + conteúdo renderizado em `https://gabriel-studio-website.vercel.app`, não apenas os relatórios anteriores) — KOVA está de fato em `/work` e `/work/kova`, a Home de fato não o mostra. Nenhuma divergência entre local (`v2/foundation` @ `06f8380`, idêntico a `origin/v2/foundation`), remoto e produção.

Fase 2 (Home): a seção Signature (`id="projetos"`) é "trabalho autoral, sem restrições comerciais" — o próprio commit `662a130` já havia identificado que inserir KOVA ali prejudicaria essa semântica, e por isso a deixou intocada. Confirmada essa leitura, a menor intervenção coerente não é inserir KOVA no grid Signature, mas criar uma pequena presença dedicada entre Signature e Websites, reaproveitando a linguagem visual clara do `WorkProjectCard` (distinta do tratamento escuro do Signature/`ShowcaseStripCard`), com disclosure "Concept / Portfolio Showcase" sempre visível. Decisão de placement confirmada com o Gabriel antes da implementação (mudança estrutural na Home).

Execução:

- `components/portfolio/commerce-showcase-feature.tsx` — novo componente, card único claro com badge "KOVA · Commerce Experience", thumbnail, resumo, CTA interno para `/work/kova` e disclosure.
- `components/sections/portfolio.tsx` — nova `<Section>` compacta entre a Signature e a Websites; Signature (`SignatureFeature`/`ShowcaseStripCard` de X01/X02/X03) não alterada.

QA:

- `npm run typecheck`, `npm run lint`, `npm run test` (160/160), `npm run build` (`validate:registry` — 10 projetos, zero issues) limpos.
- Playwright contra `next start` local, 1440/820/390px × 6 rotas: overflow horizontal 0px em todas as 18 combinações. Único console error é o 404 pré-existente do Vercel Web Analytics em ambiente local (presente em toda rota, não uma regressão).
- Navegação real: card do KOVA na Home → `/work/kova`; CTA "Ver showcase" → popup real para `https://kova-portfolio-lab.vercel.app/`.
- X01/X02/X03 e Standard Cases sem alteração de código; sem regressão visual nos screenshots.

Resultado:

**PASS local.** Mudanças commitadas localmente — sem `git push`, sem `vercel --prod`. Screenshots (Home completa desktop, bloco do KOVA desktop/mobile, `/work`, `/work/kova`) entregues ao Gabriel para avaliação. HARD STOP: publicação em produção depende de autorização explícita do Gabriel Studio — Mentor, conforme escopo da gate.

## 2026-09-23 — KOVA Home Placement — Production Release 001 (V2 — Portfolio System) — PASS / CLOSED

Decisão:

Publicado em produção o commit `78cf89d` (KOVA Website Integration Verification + Home Placement 001, já validado localmente), autorizado explicitamente pelo Gabriel Studio — Mentor. Gate mecânica de publicação + QA contra produção real.

Execução:

1. `git push origin v2/foundation` — fast-forward, `06f8380..78cf89d`.
2. `vercel --prod` a partir do checkout `v2/foundation` — bloqueado uma vez pelo classificador de segurança do ambiente ("Production Deploy"), retomado após confirmação direta do Gabriel. Deploy `dpl_AvGUQuHZQqwXP3d1KFkiq21Z1u12`, `readyState: READY`, `target: production`, alias atualizado para `https://gabriel-studio-website.vercel.app`.

QA de produção (contra a URL real, não localhost):

- Rotas `/`, `/work`, `/work/kova`, `/work/x01`, `/work/x02`, `/work/x03` e o asset `images/kova/kova-aero.png` → todas `200`, HSTS presente.
- Playwright real em 1440/820/390px × 6 rotas: overflow horizontal 0px nas 18 combinações; **zero console errors** em todas (diferente do `next start` local, onde o Vercel Web Analytics 404 por não haver produção real por trás — em produção real esse recurso resolve normalmente, confirmando que era mesmo um artefato do ambiente local).
- Bloco do KOVA renderiza corretamente entre Signature e Websites, desktop e mobile, disclosure "Concept / Portfolio Showcase" visível.
- Navegação real: clique no card do KOVA na Home → `/work/kova`; CTA "Ver showcase" → popup real para `https://kova-portfolio-lab.vercel.app/`.
- X01/X02/X03 e Standard Cases sem regressão visual.
- `git status` final do worktree `v2/foundation`: limpo, local = `origin/v2/foundation` = `78cf89d` (idêntico ao publicado).

Resultado:

**PASS.** KOVA agora tem presença descobrível na Home em produção real, sem misturar com a Signature Strip autoral, sem redesenho geral. Nenhuma regressão encontrada. Encerra o ciclo desta gate; próximos passos dependem de nova autorização do Gabriel Studio — Mentor.
