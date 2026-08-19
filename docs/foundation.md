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

## Componentes ambientes (`components/shared`)

Introduzidos na Sprint 16 (V3) para dar atmosfera às seções escuras sem duplicar lógica em cada uma. Todos decorativos (`aria-hidden`, sem impacto em acessibilidade) e respeitam `prefers-reduced-motion`.

| Componente | Função |
|---|---|
| `AmbientGlow` | Blob de luz verde desfocado, com deriva lenta em CSS — o "clima" de fundo das seções escuras. |
| `AmbientLines` | Linhas SVG decorativas, usadas em cantos (ex: CTA Final). |
| `EdgeFade` | Dissolve em gradiente na borda entre uma seção e a próxima de tom diferente, evitando costura visual. |
| `TechGrid` | Textura de grid técnico bem sutil, opcionalmente com deriva (`drift`). |
| `FloatingBadge` | Chip flutuante decorativo (ex: "Em produção" na Hero). |
| `BrowserFrame` | Moldura de janela de navegador em volta de screenshots reais (Projetos, Landing Pages Showcase). |
| `TechPlaceholder` | Placeholder com grid + ícone para projetos sem screenshot real ainda — nunca inventa uma imagem. |

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

## Superfícies escuras por seção (V3)

A partir da Sprint 16, algumas seções (Hero, Navbar, Processo, Projetos, Tecnologias, Sobre, CTA Final, Footer) usam uma atmosfera escura mesmo com o site em modo claro. Isso **não** cria tokens novos: reaproveita a classe `.dark` já existente, aplicada diretamente no wrapper da seção (`className="dark"` na `Section`, ou no elemento raiz). Como os tokens (`--background`, `--foreground`, `--border`, `--brand`, etc.) são CSS custom properties, elas fazem cascade normal para toda a subárvore — qualquer componente da seção (Button, Badge, Heading) já responde corretamente sem alteração de código, incluindo os utilitários `dark:` do shadcn que já existiam mas nunca eram ativados.

- `dark` + `background="default"` → quase-preto (`oklch(0.145)`), usado em Hero, Sobre, CTA Final.
- `dark` + `background="muted"` → grafite (`oklch(0.269)`), usado em Processo, Projetos e Tecnologias — as três compartilham o mesmo tom para não criar costura visual entre elas.
- Footer usa `dark` + `background="muted"` (grafite), criando continuidade suave com o preto do CTA Final sem repetir exatamente o mesmo tom.
- Seções que permanecem claras (Serviços, Diferenciais, FAQ) não recebem a classe `dark`.
- `--background` do tema claro deixou de ser branco puro (`oklch(1 0 0)`) e passou a um off-white muito sutil (`oklch(0.9911 0.0013 106.42)`), para bater com a direção "off-white" pedida no brief da V3.
- Utilitário `.bg-grid` (em `@layer utilities`) desenha uma textura de grid técnico extremamente discreta, reaproveitando o token `--color-border`. Usado atrás de Hero e CTA Final.
