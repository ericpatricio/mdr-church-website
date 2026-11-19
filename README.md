# MDR Church website

Bilingual static website for Iglesia de Dios Manantial de Restauración. A small
Node generator produces 20 localized pages: six main pages and four ministry
detail pages in Spanish and English. GitHub Pages serves committed HTML under
`/mdr-church-website/`. The default file-based website needs no frontend framework,
backend or package installation. The separate Sanity Studio is deployed; an
opt-in website release candidate is documented in
[SANITY_RELEASE_READINESS.md](SANITY_RELEASE_READINESS.md).

## Local development in VS Code

Install Node.js 18 or later and Git, clone `ericpatricio/mdr-church-website` or
open your existing checkout in VS Code, and use the integrated terminal at the
repository root. No `npm install` is required.

```powershell
npm.cmd run build
npm.cmd run check
npm.cmd test
npm.cmd run dev
```

On other shells, use `npm` with the same commands. `npm.cmd` avoids Windows
PowerShell's possible block on `npm.ps1` without changing execution policy.
Visit <http://127.0.0.1:4173/mdr-church-website/>. The server remains running until
Ctrl+C. Edit source, rebuild in a second terminal, then refresh the browser;
there is no automatic rebuild or live reload.

## Source files

- `content/site.mjs`: verified church information, translations, ministry records,
  and the single event and sermon catalogs.
- `content/catalog.mjs`: publication, date, bilingual field, URL and flyer validation;
  upcoming event and sermon selection.
- `scripts/build.mjs`: shared static page generation.
- `scripts/event-rendering.mjs`: shared event markup, localized dates and escaping.
- `assets/app.js`: mobile navigation, event filtering/expiration, sermon search and
  the existing approved hero rotation.
- `assets/style.css`: existing responsive design and branding.
- `scripts/check.mjs`: generated page links, anchors, image references, language
  counterparts and GitHub Pages relative paths.
- `scripts/test*.mjs`: dependency-free content, generated-output and synthetic
  interaction tests. No browser test runner is installed.

Edit source files and rebuild instead of editing `en/*.html` or `es/*.html`.
See [EVENTS_GUIDE.md](EVENTS_GUIDE.md) for adding, previewing, publishing,
correcting and cancelling events. See [content/PUBLISHING.md](content/PUBLISHING.md)
for the existing sermon workflow and [assets/SOURCES.md](assets/SOURCES.md) for
image provenance. Legacy assets are retained.

## Content boundaries

No approved special events or sermon recordings have been provided. Both catalogs
remain empty; synthetic tests never publish fictional church events. Weekly
services stay separate from special events. Ministry descriptions, leaders,
program ages and schedules must not be inferred from photographs. Existing
pastoral names and labelled portrait placeholders are preserved. Service times
still need final church confirmation. Verified church information is unchanged.

Events use draft, published and cancelled states. Existing event records without
status retain the legacy `verified` mapping. The homepage shows the next three
published upcoming events; the Events page also labels future cancellations.
Browser checks remove expired cards on load, every 30 seconds and when a tab
becomes visible. Later homepage cards take their places without a rebuild. With
JavaScript disabled, event cards are hidden with an explanatory message.
New content and corrections still require rebuilding and approved deployment.

## Branch and review workflow

Current implementation branch: `development/sanity-events-poc`.
Check `git status` and `git branch --show-current` before editing. Work on a
dedicated development branch; do not commit directly to `main`. Run all three
checks above, review both languages locally and inspect the VS Code Source
Control diff. Commit source, flyers and generated HTML together in focused changes.
After owner approval to push, publish the development branch and open a GitHub
pull request targeting `main`. Merge and deployment require separate approval.

No push, merge or deployment is authorized for this refactor. Historical release
notes in AUDIT.md and QA.md describe earlier work, not current authorization.

## Validation limits

`npm test` runs real generator/checker integration tests in an isolated temporary
directory and synthetic DOM tests; it does not replace browser or screen-reader
testing. See [QA.md](QA.md) for executed checks and current limitations.


## Controlled church pilot

Normal `npm run build` now uses the source selected by `content/event-source.mjs`: Sanity published events for the pilot. See [PRODUCTION_RELEASE.md](PRODUCTION_RELEASE.md) for reproducible activation and the durable file-based rollback, and [GUIA_ADMIN_EVENTOS.md](GUIA_ADMIN_EVENTOS.md) for nontechnical Spanish administrator instructions. Earlier preparation notes above describe the pre-activation phase.
