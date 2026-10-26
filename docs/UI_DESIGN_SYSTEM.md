# UI design system

Visual foundation lives in `app/globals.css`. All three portal sidebars share the React component `app/components/app-sidebar.tsx`; role wrappers provide distinct allowed menu items and context. Root typography uses the self-hosted `Plus_Jakarta_Sans` loader from `next/font/google` in `app/layout.tsx`, with the CSS variable `--font-plus-jakarta` and system fallback.

## Implemented tokens

| Category | Tokens and current values |
|---|---|
| Brand | `--color-primary` (`#0C5335`), `--color-primary-hover` (`#1E8A5F`), `--color-primary-tint` (`#E8F5EE`) |
| Surface and text | `--color-bg-base` (`#F8FAF7`), `--color-surface` (`#FFFFFF`), `--color-text` (`#26312C`), `--color-text-muted` (`#66746B`), `--color-border` (`#D8E4DE`) |
| Semantic | warning `#8B5E00` / `#FEF3C7`; success `#166534` / `#DCFCE7`; danger `#A33333` / `#FEE2E2`; information `#315B91` / `#E8F0FB` |
| Type | `--font-body`; sizes `--text-xs` 12px, `--text-sm` 14px, `--text-base` 16px, `--text-lg` 18px, `--text-xl` 22px, `--text-2xl` 24px; page-title and KPI aliases |
| Spacing | 4, 8, 12, 16, 20, 24, and 32px via `--space-1` to `--space-8`; `--space-7` 28px and `--space-10` 40px |
| Shape/elevation | control radius 8px, alert radius 12px, card radius 16px, chip radius 9999px; `--shadow-sm`, `--shadow-md` |
| Motion/layers | 180ms standard easing, sidebar/overlay/dialog layers 20/40/50; reduced-motion system preference disables transitions and smooth scroll |
| Control/focus | shared target height 40px; keyboard focus is a 2px solid semantic focus outline with 3px offset |

Legacy colors and layout tokens remain in use by older page selectors. Do not remove them until all consumers migrate and visual checks cover those routes.

## Shared layout and component rules

- Portal shells share a light canvas, border, radius, and elevation. Desktop sidebar baseline is 248px; compact desktop uses 216px. At 760px and below the sidebar becomes a 2-column mobile navigation area.
- Active navigation uses the semantic green tint and leading indicator; role-specific items remain distinct.
- Portal headers share 21–24px title scale and 14px supporting text. Cards share surface, border, 16px radius, and small elevation where the common selectors apply.
- Tables that exceed narrow viewports use a containing horizontal scroller rather than shrinking every column until unreadable.
- Inputs and buttons have global focus-visible treatment; icon-only controls require a visible or accessible label from the page implementation.
- Demo banners label simulated information. A table showing a sample must not imply the sample is the whole population.

## Role consistency matrix

| Component | Calon Siswa | Admin | Kepala Sekolah | Shared rule / exception |
|---|---|---|---|---|
| Sidebar | `StudentSidebar` | `AdminSidebar` | `PrincipalSidebar` | Shared `AppSidebar`; menus and help differ by role. |
| Role guard | SISWA | ADMIN | KEPALA_SEKOLAH | Existing server layout guards remain authoritative. |
| Metrics/cards | Application progress and student tasks | Review queue and workflow | Read-only monitoring | Common surface/tokens; content and actions remain role-appropriate. |
| Lists/tables | Own profile/docs/results | Operational worklists | Monitoring only | Existing role-specific behavior retained; narrow layouts scroll horizontally where needed. |
| Demo mode | Existing demo/query support | Existing simulation | Existing simulation | Demo presentation never grants access or changes persistence. |

## Migration boundaries

The application has a large global stylesheet with older local rules. Full conversion to React primitives or CSS modules is not yet complete. Avoid broad selector rewrites until all three roles and all key routes can be checked at desktop, tablet, and phone widths. Auth/session, API authorization, SPMB policy, data model, and persisted behavior are not design-system concerns and must not be changed as part of UI polish.

## Verification for this audit continuation

- `npm test`: passed, 71 tests.
- `npm run typecheck`: passed.
- `npm run lint`: passed with no warning after removing one unused import in the audited route component.
- `npm run build`: Turbopack stopped because Windows denied creating a Prisma Client junction under `.next`; the fallback `npx next build --webpack` stopped because Windows denied making `.next/types/app/portal/kepala-sekolah/pendaftar`. Neither produced a successful local production build.
- Visual Preview inspection: six Kepala Sekolah demo routes at the available narrow browser viewport; not the full role/viewport matrix.

Admin and student visual coverage, public/login pages, and the requested 360/390/1024/1280/1440px viewport matrix remain outstanding unless subsequent QA evidence is added here. A successful remote Preview deployment build is not a substitute for direct visual inspection of those screens.
