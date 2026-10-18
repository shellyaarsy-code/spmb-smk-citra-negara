# UI design system consolidation

The shared foundation lives in `app/globals.css` and is used by the public pages, authentication screens, and the Admin, Kepala Sekolah, and Siswa portals.

## Shared tokens

- Typography: Inter when available, then Segoe UI and Arial; a 12/14/16/18/22/24 px scale, 13 px labels, and shared 1.25/1.5/1.65 line heights.
- Spacing: 4, 8, 12, 16, 20, 24, and 32 px tokens. Page-specific layouts can keep their own responsive grid gaps.
- Dimensions: 40 px shared controls, public header height, 1440 px content width, 1500 px dashboard width, and separate Admin, Principal, and Student sidebar widths including compact breakpoints.
- Surfaces: shared panel and control radii, standard border, panel shadow, focus ring, and semantic warning, success, danger, and information colors.
- Shared component rules: role navigation, common action buttons, form controls, dashboard headings and descriptions, registration and results tables, card surfaces, and status badges.

Role-specific layout colors and responsive behavior remain where they support the distinct workflows. Existing `BrandLogo` sizing rules also remain role-specific so the official emblem keeps its aspect ratio in each header.

## Legacy styles

The stylesheet still contains many page-level `font-size` declarations, including overrides for compact mobile layouts, chart labels, small status chips, and dense selection data. The latest static count is 893 declarations; this work does not claim they have all been converted to the shared scale. Shared token rules now govern common form controls, portal navigation, dashboard descriptions and headings, table cells, buttons, authentication copy, and status badges. Some older declarations for those elements remain in the file and are superseded by the shared rules; page-local chart and dense data labels retain their sizing pending visual review at supported viewport widths.

Do not replace the remaining declarations wholesale. Migrate a page group at a time and verify its desktop and mobile layout before removing its local rules.
