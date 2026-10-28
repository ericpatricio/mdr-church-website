# MDR church website

Bilingual, buildless static website for Iglesia de Dios Manantial de Restauración. GitHub Pages compatible; committed HTML is the deployment artifact. No deployment workflow is introduced.

## Development

Node.js 18+; no package installation required.

- `npm run build`: regenerate the 12 Spanish/English pages from `scripts/build.mjs`.
- `npm run check`: validate local links, image references, headings, language counterparts and hero anchors.
- `npm run dev`: serve at http://127.0.0.1:4173/mdr-church-website/ to exercise the GitHub Pages subpath.

Edit translated copy and shared page templates in `scripts/build.mjs`, shared presentation in `assets/style.css`, and menu behavior in `assets/app.js`. Regenerate and check before committing. All internal links are relative. Manrope loads from Google Fonts with an Arial fallback.

## Content provenance and pastoral review

The address and four service times come from the project brief. No service names, pastoral biographies, ministry offerings, special events or contact details are inferred. No sermon URLs are published without verification. No event filters are shown because there are no confirmed event records.

**Original MDR logo and authentic photography are not present in the source repository.** The provisional icon has been removed; the header currently uses the official name as HTML text. This is a review limitation, not a replacement original logo. Obtain authorized original assets before final approval, then add the logo as a separate image with descriptive alternative text. The existing small SVG illustrations contain no embedded headings, buttons or logos, and their illustrative nature is labeled in both languages.

Keep the development branch separate. Merge and publication require the owner's approval. No production deployment has been performed.

## QA performed

See `QA.md` for observed checks and remaining limitations.
