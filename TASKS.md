# TASKS.md

Backlog oficial do projeto Gabriel Studio Sites. Organizado por Sprints, cada Task pequena, objetiva e executável. Nunca remover histórico — Tasks concluídas ficam marcadas e visíveis, novas Sprints são criadas conforme o projeto evoluir.

# TASKS.md

# Sprint 01 — Fundação do Projeto

## Objetivo

Inicializar a base oficial do Gabriel Studio Website, criando a arquitetura que servirá como template para todos os futuros sites da empresa.

---

## TASK 001 — Inicialização

- [ ] Criar projeto utilizando Next.js (App Router)
- [ ] Configurar TypeScript
- [ ] Configurar Tailwind CSS
- [ ] Configurar ESLint
- [ ] Configurar Prettier

---

## TASK 002 — Dependências

Instalar e configurar:

- [ ] shadcn/ui
- [ ] Framer Motion
- [ ] Lucide Icons
- [ ] clsx
- [ ] class-variance-authority
- [ ] tailwind-merge

---

## TASK 003 — Estrutura

Criar a estrutura padrão:

app/

components/

components/ui/

components/layout/

components/sections/

hooks/

lib/

public/

styles/

types/

docs/

---

## TASK 004 — Layout Base

Criar:

- [ ] Layout global
- [ ] Container padrão
- [ ] Sistema de espaçamentos
- [ ] Sistema de cores
- [ ] Tipografia base

---

## TASK 005 — Componentes Base

Criar componentes reutilizáveis:

- [ ] Button
- [ ] Section
- [ ] Container
- [ ] Badge
- [ ] Heading

Todos devem ser reutilizáveis.

---

## TASK 006 — Navbar

Implementar apenas a estrutura.

Links:

- Serviços
- Projetos
- Sobre
- Contato

CTA:

Solicitar orçamento

Ainda sem animações complexas.

---

## Critérios de Conclusão

- Projeto inicia sem erros.
- TypeScript funcionando.
- Tailwind configurado.
- shadcn funcionando.
- Estrutura organizada.
- Componentes reutilizáveis criados.
- Navbar implementada.
- Build funcionando.
- ESLint sem erros.

Após concluir esta Sprint, aguardar aprovação antes de iniciar a Sprint 02.

Caso encontre uma melhoria de arquitetura durante a implementação, proponha-a antes de modificar o escopo

---

# Sprint 02 — Hero do Gabriel Studio Website

## Objetivo

Implementar a Hero principal do site institucional, comunicando o que a Gabriel Studio faz, para quem, qual transformação entrega e qual é a próxima ação do visitante. Nenhuma outra seção foi implementada nesta Sprint.

---

## TASK 007 — Hero

- [x] Estrutura da Hero (`components/sections/hero.tsx`)
- [x] Conteúdo textual (eyebrow, headline, descrição)
- [x] CTAs (primário `brand`, secundário `outline`)
- [x] Painel visual (placeholder elegante, aguardando `public/images/010-resultado.png`)
- [x] Faixa de competências
- [x] Responsividade (390 / 768 / 1024 / 1440)
- [x] Acessibilidade (h1 único, foco visível, `aria-hidden` no painel decorativo)
- [x] Animações discretas (fade + reduced motion)
- [x] Build, lint e TypeScript

---

## Critérios de Conclusão

- `npm run lint` sem erros.
- TypeScript sem erros.
- `npm run build` sem erros.
- Validado em 390px, 768px, 1024px e 1440px — sem overflow horizontal, sem quebra ruim da headline.
- Apenas um `h1` na página.
- Reutiliza Button, Badge, Container, Section e Heading — nenhum sistema visual paralelo criado.

Aguardar aprovação antes de iniciar a Sprint 03.

---

# Sprint 03 — Seção "Serviços"

## Objetivo

Criar a seção "Serviços" logo abaixo da Hero, explicando claramente o que a Gabriel Studio faz.

---

## TASK 008 — Services

- [x] Estrutura da seção (`components/sections/services.tsx`)
- [x] Eyebrow, título e descrição
- [x] Grid 2x2 (1 coluna no mobile) com 4 cards (ícone Lucide, título, descrição)
- [x] Hover discreto e leve elevação
- [x] Adicionada em `app/page.tsx` logo abaixo da Hero

---

## Critérios de Conclusão

- `npm run lint` e `npm run build` sem erros.
- Reutiliza Container, Section, Heading, Badge — nenhum sistema visual paralelo.
- Sem cards coloridos ou elementos exagerados.

Aguardar aprovação antes de iniciar a Sprint 04.

---

# Sprint 04 — Seção "Como Trabalhamos"

## Objetivo

Criar a seção "Processo", logo abaixo de Serviços, transmitindo organização e um processo bem definido.

---

## TASK 009 — Process

- [x] Estrutura da seção (`components/sections/process.tsx`)
- [x] Eyebrow, título e descrição
- [x] Timeline com 5 etapas (Descoberta, Planejamento, Desenvolvimento, Validação, Entrega)
- [x] Horizontal no desktop, vertical no mobile — conexão discreta entre etapas
- [x] Adicionada em `app/page.tsx` após Services

---

## Critérios de Conclusão

- `npm run lint` e `npm run build` sem erros.
- Apenas cinzas, branco e verde como destaque.
- Nenhuma seção anterior alterada.

Aguardar aprovação antes de iniciar a Sprint 05.

---

# Sprint 05 — Seção "Projetos"

## Objetivo

Criar a seção "Projetos", logo abaixo de Processo, apresentando projetos próprios e um placeholder para futuros cases.

---

## TASK 010 — Projects

- [x] Estrutura da seção (`components/sections/projects.tsx`)
- [x] Eyebrow, título e descrição
- [x] Grid responsivo (3 colunas desktop, 2 tablet, 1 mobile) com 3 cards
- [x] Cada card com imagem placeholder minimalista, categoria, título, descrição e badge de status
- [x] Adicionada em `app/page.tsx` após Process

---

## Critérios de Conclusão

- `npm run lint` e `npm run build` sem erros.
- Nenhum depoimento, número ou logo de cliente inventado.
- Nenhuma seção anterior alterada.

Aguardar aprovação antes de iniciar a Sprint 06.

---

# Sprint 06 — Tecnologias

## Objetivo

Criar uma seção elegante apresentando as tecnologias utilizadas pela Gabriel Studio, sem parecer uma lista de ferramentas.

---

## TASK 011 — Technologies

- [x] Estrutura da seção (`components/sections/technologies.tsx`)
- [x] Eyebrow, título e descrição
- [x] Grid responsivo com as 12 tecnologias (nome + ícone monocromático + borda discreta)
- [x] Sem logos coloridos
- [x] Adicionada em `app/page.tsx` após Projects

---

## Critérios de Conclusão

- `npm run lint` e `npm run build` sem erros.
- Cards extremamente minimalistas, consistentes com o restante do site.

Aguardar aprovação antes de iniciar a Sprint 07.

---

# Sprint 07 — Revisão Visual e UX + Refinamentos

## Objetivo

Revisar o conjunto da landing page (Navbar, Hero, Serviços, Processo, Projetos, Tecnologias) como uma experiência única e implementar os ajustes aprovados.

---

## Diagnóstico

- 🔴 Crítico: navegação por âncoras quebrada — nenhuma `<section>` tinha `id`.
- 🟡 Importante: repetição visual entre as 4 seções internas (mesmo padrão de cabeçalho centralizado).
- 🟡 Importante: nenhuma variação de fundo entre seções (todas brancas).
- 🟡 Importante: inconsistência de `border-radius` entre cards (`rounded-2xl` vs `rounded-xl`).
- 🟢 Refinamento: TASKS.md desatualizado (Sprints 03–06 não registradas).

## TASK 012 — Refinamentos aprovados

- [x] Ids adicionados às seções: `hero`, `servicos`, `processo`, `projetos`, `tecnologias` — Navbar e CTAs da Hero agora rolam corretamente até a seção
- [x] Ritmo visual criado alternando fundo: Hero (default) → Serviços (default) → Processo (`muted`) → Projetos (default) → Tecnologias (`muted`)
- [x] Cards padronizados para `rounded-2xl` (Tecnologias estava em `rounded-xl`)
- [x] TASKS.md atualizado registrando as Sprints 03, 04, 05, 06 e 07

---

## Critérios de Conclusão

- `npm run lint` e `npm run build` sem erros.
- Validado em desktop, tablet e mobile.
- Hero, copy, tipografia, grid, componentes, espaçamentos e sistema de animações não alterados.

Aguardar aprovação antes de iniciar a Sprint 08.

---

# Sprint 08 — Diferenciais

## Objetivo

Criar uma seção de diferenciais logo abaixo de "Tecnologias", respondendo por que a Gabriel Studio é uma boa escolha.

---

## TASK 013 — Differentials

- [x] Estrutura da seção (`components/sections/differentials.tsx`)
- [x] Eyebrow, título e descrição
- [x] Grid 2x2 (1 coluna no mobile) com 4 diferenciais (Código limpo, Performance, Escalabilidade, Parceria)
- [x] `id="diferenciais"`, mesmo padrão visual das demais seções
- [x] Adicionada em `app/page.tsx` após Technologies

---

## Critérios de Conclusão

- `npm run lint` e `npm run build` sem erros.
- Sem comparações com concorrentes ou frases de marketing vazias.
- Nenhuma cor ou efeito novo.

Aguardar aprovação antes de iniciar a Sprint 09.

---

# Sprint 09 — FAQ

## Objetivo

Criar uma seção de Perguntas Frequentes logo abaixo de "Diferenciais", reduzindo objeções antes do CTA final.

---

## TASK 014 — FAQ

- [x] `Accordion` do shadcn/ui instalado (`components/ui/accordion.tsx`) — nenhum componente próprio criado
- [x] Estrutura da seção (`components/sections/faq.tsx`)
- [x] Eyebrow, título e descrição
- [x] 5 perguntas em `Container size="narrow"`
- [x] `id="faq"`
- [x] Adicionada em `app/page.tsx` após Differentials

---

## Critérios de Conclusão

- `npm run lint` e `npm run build` sem erros.
- Acessibilidade do Accordion validada (`aria-expanded`, teclado).
- Nenhuma seção existente alterada.

Aguardar aprovação antes de iniciar a Sprint 10.

---

# Sprint 10 — CTA Final

## Objetivo

Criar a seção final de conversão, logo abaixo do FAQ, encerrando a página com um caminho principal claro para contato. Footer não implementado nesta Sprint.

---

## TASK 015 — Final CTA

- [x] Estrutura da seção (`components/sections/final-cta.tsx`)
- [x] Eyebrow, título e descrição
- [x] CTA principal (`brand`) → `#contato` e CTA secundário (`outline` adaptado) → `#projetos`
- [x] Fundo de alto contraste (`bg-foreground`/`text-background`, apenas tokens existentes)
- [x] Brilho verde discreto, entrada suave em scroll, hover discreto — token `brand` apenas no botão principal
- [x] `id="contato"` — Navbar e CTA da Navbar apontam para cá e agora funcionam
- [x] Adicionada em `app/page.tsx` após Faq

---

## Critérios de Conclusão

- `npm run lint` e `npm run build` sem erros.
- Validado em 390px, 768px, 1024px e 1440px, navegação por teclado, contraste, foco visível, âncoras.
- Navbar, Hero, Serviços, Processo, Projetos, Tecnologias, Diferenciais, FAQ, tokens e tipografia global não alterados.

Aguardar aprovação antes de iniciar a Sprint 11.

---

# Sprint 11 — Footer

## Objetivo

Implementar o Footer oficial — última seção da Landing Page V1. Organização, credibilidade, encerramento natural. Menos é mais.

---

## TASK 016 — Footer

- [x] Estrutura da seção (`components/sections/footer.tsx`)
- [x] 3 colunas no desktop (marca, navegação, contato), empilhado no mobile
- [x] Navegação com as âncoras existentes: `#servicos`, `#processo`, `#projetos`, `#tecnologias`, `#diferenciais`, `#faq`, `#contato`
- [x] Contato (WhatsApp, E-mail, LinkedIn, GitHub) com `href="#"` temporário — nenhum link inventado
- [x] Rodapé inferior com linha divisória, copyright e "Desenvolvido com Next.js + TypeScript."
- [x] Adicionado ao final de `app/page.tsx`

---

## Critérios de Conclusão

- `npm run lint` e `npm run build` sem erros.
- Sem cards, gradientes, cores novas ou fundo diferente do restante da página.
- Reutiliza `Container`, `sectionVariants` (do `Section`) e `Heading`.

Landing Page V1 completa. Aguardar revisão geral antes de qualquer nova implementação.