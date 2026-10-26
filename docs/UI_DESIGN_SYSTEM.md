# UI design system

The shared visual foundation is maintained in `app/globals.css` and is used by public pages, authentication screens, and the Admin, Kepala Sekolah, and Siswa portals.

## Semantic tokens

The semantic tokens added for the SPMB foundations are `--color-primary`, `--color-primary-hover`, `--color-primary-tint`, `--color-bg-base`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-border`, and foreground/background pairs for warning, success, danger, and information. Additional tokens cover focus, sidebar states, typography, spacing, radius, elevation, motion, and layer order.

Legacy tokens remain as compatibility aliases while page-level styles are migrated. Do not remove them until their consumers have been migrated and checked.

## Typography

The requested family is Plus Jakarta Sans. `--font-body` points at that family, but the repository does not currently include or load its font asset; browsers without the family installed will use their sans-serif fallback. The shared size tokens cover 12, 14, 16, 18, 22, and 24 px plus overline, page-title, and KPI sizes. Many older page-specific font sizes remain and need page-by-page migration.

## Dashboard navigation

All three role sidebars now render through the shared React component in app/components/app-sidebar.tsx; role-specific wrappers supply menus and optional contextual panels. Their visual styling is normalized through shared selectors: light surface, semantic text, green-tinted active item with a leading indicator, shared 248 px desktop width, 20 px icons, 44 px targets, and a horizontally scrollable navigation row on mobile. A shared React `AppSidebar`/`AppShell` has not yet been introduced.

## Remaining work

Page-local color, spacing, radius, shadow, and typography literals remain in the large global stylesheet. Continue migrating a page group at a time and verify layout, contrast, keyboard access, and mobile behavior. Status chips, cards, forms, topbars, empty/loading/error states, and data/demo modes still need shared primitives and adoption across roles.