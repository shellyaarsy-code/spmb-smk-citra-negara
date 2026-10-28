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

## Refinement checkpoint (2026-10-28)

This checkpoint is a targeted refinement, not a redesign or rebuild.

- The legacy admin, principal, and student sidebar width aliases now reference the established shared desktop and compact width tokens instead of maintaining separate desktop values.
- The three role login shells now share a common maximum width, minimum-height strategy, border, radius, and elevation based on existing design tokens. Their role-specific content, panel ratios, forms, and authentication behavior remain separate.
- Existing mobile full-screen login behavior is preserved by explicitly removing desktop border/radius/elevation on narrow layouts.
- Authentication heading sizes and input heights have been brought closer together; the existing Plus Jakarta Sans font and role-specific form fields are retained.
- The three portal-selection cards now use matching outline SVG icons with a shared 20px icon size instead of unrelated text glyphs.
- The shared brand-logo component now points to `public/logo-cn-transparent.svg`, which preserves the existing `logo-cn.png` source and applies a narrow green-channel alpha mask to the outside background. This is a reversible presentation-layer workaround; it must be visually checked against light and dark surfaces to ensure no emblem details are lost.
- Plus Jakarta Sans, the existing green palette, page structure, role-specific navigation, and authentication/data flows have not been replaced as part of this refinement.
- These CSS changes have been committed to `integration/demo-shared-data`. They have not been merged to `master`. A new Preview build and screenshot comparison are still required before treating the visual result as verified.

## Verification for this audit continuation

- `npm test`: passed, 71 tests.
- `npm run typecheck`: passed.
- `npm run lint`: passed with no warning after removing one unused import in the audited route component.
- `npm run build`: Turbopack stopped because Windows denied creating a Prisma Client junction under `.next`; the fallback `npx next build --webpack` stopped because Windows denied making `.next/types/app/portal/kepala-sekolah/pendaftar`. Neither produced a successful local production build.
- Visual Preview inspection: six Kepala Sekolah demo routes on the previous READY deployment at the available narrow browser viewport; new deployment public landing, Admin login, Kepala Sekolah login, Calon Siswa login, and registration form at a 1280×720 browser viewport. The registration form was only viewed; it was not submitted.

Admin and student authenticated dashboard visual coverage and the requested 360/390/1024/1440px viewport matrix remain outstanding. The new Preview uses a host-only session cookie, so the existing principal session on the previous deployment does not carry to the new deployment. No credential was entered; the new Preview login screens therefore remain the safe stopping point until the user logs in manually. A successful remote Preview deployment build is not a substitute for direct visual inspection of those screens.

## Cross-role consistency checkpoint

- Admin and principal demo notices share the `portal-demo-notice` visual layer while retaining role-specific wording and existing component classes.
- Desktop sign-out actions are placed at the bottom of each role sidebar. On narrow layouts, the sign-out action is presented inside the horizontally scrollable/compact navigation so it remains discoverable.
- Sign-out continues to use the shared `AuthLogoutLink` POST request to `/api/auth/logout`; this change only adjusts presentation and placement.
- Account identity remains role-appropriate: admin identity in the dashboard header, principal identity in the sidebar, and student identity/status in the dashboard header. These positions are not forcibly made identical because they carry different role-specific context.
- The current verification covers a successful production build/TypeScript check and HTTP 200 for public preview routes and CSS assets. Authenticated dashboard visuals, real browser screenshots, and full interaction testing still require separate QA; do not describe those as completed based on build status alone.

