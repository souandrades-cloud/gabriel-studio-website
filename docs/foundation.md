# Fundação — Template Base

Documentação de arquitetura da Sprint 01. Referência rápida para novos projetos que partirem deste template.

## Cores

Tokens semânticos vivem em `app/globals.css` (`:root` / `.dark`), registrados no Tailwind via `@theme inline`.

- `background` / `foreground` / `muted` / `border` — escala neutra (shadcn, base `neutral`).
- `brand` / `brand-hover` / `brand-active` / `brand-foreground` / `brand-muted` — verde, único destaque de cor do projeto (`bg-brand`, `text-brand`, etc). Não usar `brand` como cor de base em grandes áreas — é reservado para CTAs e realces pontuais.

## Tipografia

- `--font-sans` (Geist) para corpo e headings — `--font-heading` aponta para o mesmo token.
- `--font-mono` (Geist Mono) para uso pontual (código, dados).
- `h1`–`h6` já recebem peso/tracking padrão via `@layer base` em `globals.css`.

## Componentes base (`components/ui`)

| Componente | Uso |
|---|---|
| `Button` | `variant`: `default`, `brand`, `outline`, `secondary`, `ghost`, `destructive`, `link`. Use `brand` para CTAs de conversão. |
| `Badge` | Mesmas variantes de cor do Button (`default`, `brand`, etc). |
| `Container` | Largura máxima + padding horizontal responsivo. `size`: `default` (7xl), `narrow`, `wide`. |
| `Section` | Ritmo vertical padrão (`py-16 sm:py-20 lg:py-28`) + `Container` embutido. `background`: `default`, `muted`, `brand`. |
| `Heading` | `as` define a tag semântica (h1–h6); `size` define a escala visual — desacoplados de propósito. |

## Estrutura de pastas

```
app/                 rotas (App Router)
components/ui/       primitivos de design system (átomos)
components/layout/   chrome estrutural (Navbar, Footer)
components/sections/ seções de página (Hero, Services, ...)
components/shared/   utilitários entre camadas (ThemeProvider, SEO)
hooks/                hooks reutilizáveis
lib/                  utilitários (cn, etc)
types/                tipos compartilhados
docs/                 esta pasta
```

## Tema

`ThemeProvider` (`components/shared/theme-provider.tsx`) envolve `next-themes`, já configurado no `RootLayout`. Os tokens `.dark` já existem em `globals.css` — falta apenas expor um toggle de UI quando o projeto precisar de dark mode.
