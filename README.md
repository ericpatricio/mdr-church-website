# MDR website — pastoral redesign

A bilingual static website for Iglesia de Dios Manantial de Restauración. No frontend framework, runtime backend, CMS, database, or package dependencies are needed. GitHub Pages serves committed HTML under /mdr-church-website/.

## Preview and validate

Use Node.js 18 or later from the repository directory:

- npm run build — generate all 12 localized pages.
- npm run check — validate assets, links and section anchors, language counterparts, headings, dimensions, and verified-content constraints.
- npm run dev — open http://127.0.0.1:4173/mdr-church-website/.

No linter is configured. JavaScript syntax is checked with node --check. See QA.md for checks actually run.

## Maintain the site

- content/site.mjs: church information, Spanish and English translations, ministry records, verified event and sermon arrays.
- scripts/build.mjs: shared static page templates. Edit the generator, then rebuild rather than changing generated pages independently.
- assets/style.css: responsive design tokens, typography and layout.
- assets/app.js: keyboard-accessible mobile menu and event filtering.
- assets/SOURCES.md: image provenance.

The homepage follows the supplied brief: hero; services/location; community; events; leadership; ministries; latest message; visit invitation; footer. All required pages share the same header, language links, footer, typography and colors.

## Content boundaries

The owner supplied the motto, community wording, service names/times, denominational affiliation, and senior pastor names. The supplied Google Maps listing was inspected on October 28, 2026 and matches 4360 Monterey Rd, Kissimmee, FL 34758; it lists (407) 346-5036. Directions use the exact owner-supplied Maps short link. The church Instagram profile is supported by the owner's saved Instagram page.

Service times still require final church confirmation. There are no confirmed upcoming special-event or sermon records. Event filters operate on the verified list and show a truthful zero-result state. Search and fake play buttons are not shown without recordings. Ministry names/logos are supplied; descriptions of programs, ages, leaders and schedules remain pending. No portrait is assumed to represent the pastors. Leadership uses approved names without invented biography.

For future events, add only verified bilingual records with id, category (worship/community), start (ISO date/time with timezone), optional end, location, bilingual title, description and details, and optional local image filename. Past records are excluded when building. Rebuild after updates; a scheduled build is not configured. For sermons, add verified title.es/title.en, speaker, date, url and optional local image filename.

## Review workflow

Development branch: development/stock-content-enhancements. Do not merge or deploy this revision without owner approval. The existing production website is unchanged by branch commits. AUDIT.md records findings and design research; QA.md records evidence and limits.

## Latest update: stock imagery and content readiness

There are now 18 localized pages: six main pages plus Kidzz, Next and Mujeres detail pages in each language. The ministry directory and homepage link to dedicated pages. See assets/stock/credits.json for licensed temporary photos, assets/stock/README.md for replacement instructions, and content/PUBLISHING.md for approved event/message records. Stock imagery does not establish real programs or activities. Pastoral portraits remain placeholders.

content/catalog.mjs validates approved records before a build. Events are ordered by date and expired events excluded; the homepage supports three upcoming records. Verified messages support a featured latest recording, thumbnails, speaker/date, newest-first library, and accent-insensitive search when records exist. Current event/message arrays remain empty because official content is not yet available. npm test covers these behaviors using test-only fixtures.

Current review branch: development/stock-content-enhancements. No merge/deployment is authorized for this revision yet.
