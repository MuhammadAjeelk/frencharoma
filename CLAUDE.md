# French Aromas

Next.js storefront for a Dubai-based perfume house. Deployed to
frencharomas.com, with staging.frencharomas.com alongside it — see
`memory/deploy-workflow.md` for the server, the two app dirs and the process.

## Design system

The homepage was rebuilt against the designer's artwork; the rest of the site is
being migrated onto it. **Read `docs/design-migration.md` before restyling any
page** — it holds the full token table, the phase plan and the edge cases.

Short version:

- Grounds `#373838` (dark) and `#d4c6ab` (light); gold `#c9a25a`, frames `#d1ae6d`
- Retired: `#1a1a2e`, `#b8964e`, `#faf8f5`, `#f7f5f2`, `#e8e4df`, `#1c1a17`
- Section headings are Playfair italic at **`font-normal`**, `text-2xl md:text-4xl`
- No tracked-out all-caps eyebrow labels
- Square corners on cards and frames; `rounded-full` only for pills and badges
- Hover never lifts or zooms — gold glow plus `brightness-110` on photography
- Gutter `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`, applied once per section

Import from `src/lib/design.js` and `src/components/ui/SectionHeading.js` rather
than retyping hexes. The homepage sections predate these primitives and still
inline their classes; folding them in is Phase 9, not urgent.

## Conventions

- Scripts in `scripts/` are Node + `sharp`, run with `node scripts/<name>.js`
- Brand pills are generated, not hand-made: `node scripts/build-brand-pills.js`
- **Any changed image needs a new filename.** Next's image optimizer keys its
  cache on URL, not contents, so overwriting in place serves the old file
  indefinitely. Suffix `-v2`, `-v3`.
- After converting artwork to webp, open the webp and look at it before wiring
  it in.

## Migration rules

While `docs/design-migration.md` is in progress:

- Behaviour is frozen. A re-skin changes markup and styles, never handlers,
  routes, query params, state shape or API calls.
- One phase, one commit, build green before committing.
- Check the empty, loading, error, disabled and sold-out states — not just the
  populated happy path.
- `(admin)` is out of scope, but shared components like `ProductCard` are used
  there, so don't break it.
