# Gabriel Studio Website

Site institucional oficial da Gabriel Studio.

Este projeto também funciona como Template Base para futuros sites desenvolvidos pela empresa.

---

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Lucide Icons

---

## Scripts

Instalar dependências

```bash
npm install
```

Rodar ambiente local

```bash
npm run dev
```

Build

```bash
npm run build
```

Lint

```bash
npm run lint
```

---

## Estrutura

```
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
```

---

## Organização

Cada seção da Home é um componente independente em `components/sections/`.

Fluxo real da página (`app/page.tsx`):

```
Navbar

Hero
Services
Process
Projects (Landing Pages Showcase)
Technologies
Differentials
About
Faq
FinalCta

Footer
```

Sistema visual V3 (superfícies escuras por seção, componentes ambientes de `components/shared/`) documentado em `docs/foundation.md`.

---

## Padrões

- Mobile First
- Performance First
- SEO
- Código limpo
- Componentização
- Reutilização máxima

---

## Deploy

Vercel

---

## Filosofia

Construir componentes reutilizáveis.

O objetivo não é apenas criar um site.

É criar uma base sólida para acelerar todos os futuros projetos da Gabriel Studio.