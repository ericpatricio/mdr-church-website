# Estado del piloto: eventos publicados desde Sanity

Para administrar eventos del sitio publico use Studio y [GUIA_ADMIN_EVENTOS.md](GUIA_ADMIN_EVENTOS.md). No edite este catalogo de archivos para publicar en modo Sanity. Las instrucciones historicas de archivos que siguen se conservan para el modo de respaldo; vea [PRODUCTION_RELEASE.md](PRODUCTION_RELEASE.md).

# Publishing MDR events in VS Code

Events have one source of truth: the `events` array in `content/site.mjs`.
Do not edit the generated `es/*.html` or `en/*.html` files. Regular weekly
services remain in the existing schedule, separate from special events.
Keep the catalog empty until the church confirms an event.

## Open and preview the website

Use Node.js 18 or later. There are no package dependencies to install; `npm install`
is unnecessary. Open the repository folder in VS Code and open Terminal > New Terminal.
On Windows PowerShell use `npm.cmd` if `npm` reports that scripts are disabled.

```powershell
git status
git branch --show-current
npm.cmd run build
npm.cmd run check
npm.cmd test
npm.cmd run dev
```

Open <http://127.0.0.1:4173/mdr-church-website/>. Spanish and English events are at
`/mdr-church-website/es/eventos.html` and `/mdr-church-website/en/eventos.html`.
Keep the server terminal running. After editing content, run `npm.cmd run build`
in a second terminal, then refresh the browser. The server does not rebuild or
reload automatically. Stop it with Ctrl+C. On other shells, `npm` supports the
same scripts.

## Add one event and one flyer

1. Obtain church approval for the titles, descriptions, date, venue and flyer.
2. Put the flyer in `assets/events/` (create that folder if needed). Use a lowercase
   filename without spaces, such as the event's slug plus `.webp`, `.jpg` or `.png`.
   The path in the record is `events/your-filename.webp`, without `assets/`.
3. Add one object inside `export const events = [ ... ];` in `content/site.mjs`.
   Separate objects with commas. Give it a unique lowercase hyphenated `id`.
4. Start with `status: 'draft'`. Drafts are never rendered, even with complete data.
   Drafts may be incomplete, but explicit draft records need unique IDs.
5. Enter `es` and `en` strings for `title`, `description`, `details` and `imageAlt`.
   Translate the same verified information. Describe the flyer for someone who
   cannot see it; essential flyer information also belongs in the text fields.
6. Use `venue` for the verified venue name and `location` for the full address.
7. Choose `community` or `worship`. A special worship service can be an event;
   adding the normal weekly schedule as recurring events is unnecessary.

### Development/testing example — never publish as a real church event

This fenced example is documentation only; it is not imported by the build.
The synthetic automated fixtures live in `scripts/test-events.mjs` and are built
only in an isolated temporary directory. Do not add this example to public content.
The logo reference is for testing, not a real event flyer.

```javascript
{
  id: 'development-example-only',
  status: 'draft',
  category: 'community',
  title: { es: 'Prueba de desarrollo', en: 'Development test' },
  description: { es: 'Solo para pruebas.', en: 'For testing only.' },
  details: { es: 'No es un evento real.', en: 'This is not a real event.' },
  start: '2099-01-01T11:00:00-05:00',
  end: '2099-01-01T13:00:00-05:00',
  timeZone: 'America/New_York',
  venue: 'Development test venue',
  location: 'Development test address',
  image: 'mdr-logo.png',
  imageAlt: { es: 'Imagen de prueba.', en: 'Test image.' },
}
```

For real events, optional `registrationUrl` and `sourceUrl` must be verified HTTPS
URLs. Optional `contact` uses `{ es: '...', en: '...' }` with verified contact text.
Omit optional properties entirely when unavailable. `details` is displayed in an
accessible native disclosure. Cancelled events never show a registration link.
Keep one record for both languages and one shared flyer.

## Dates, timezone and daylight saving

Always set `timeZone: 'America/New_York'`. Timestamps include seconds and an offset:
`YYYY-MM-DDTHH:mm:ss-05:00` in standard time or `-04:00` in daylight time.
The validator checks the actual New York offset for that date; do not assume
every date in a month has the same offset. UTC `Z` and timestamps without offsets
are rejected for events. A nonexistent spring-forward time is rejected. During
the repeated fall-back hour, choose the offset for the intended occurrence.
For an event crossing a transition, start and end can have different offsets.
An optional end must be later than start. Without end, the event expires at start.

## Preview, publish and correct

Drafts intentionally do not appear in preview. To preview a confirmed complete
record, set its status to `published` locally, rebuild and inspect both languages.
This changes local files only. Return it to `draft` if approval is pending.
Run build, check and tests before review. Inspect the homepage, all category
buttons, flyer, dates, details and any registration link at desktop and mobile sizes.

Publishing uses the same file change: `status: 'published'`, then rebuild and
include the generated HTML in the development branch review. A status does not
deploy anything by itself. Obtain owner approval before pushing, merging or deploying.
To correct an event, edit the same record and flyer, rebuild, validate and review.
Avoid changing its ID or creating a duplicate record for the correction.

## Cancel or retain a past event

Set `status: 'cancelled'` and rebuild. Future cancelled events remain labelled
on the Events page until their original end/start; they are excluded from the
homepage. Preserve the original date and add any approved explanation to both
languages. Cancellation remains subject to the normal deployment approval.

Keep past records in the array for history. Builds omit expired events; records
are never deleted or moved automatically and never roll forward to another date.
The public site is an upcoming list, not an archive.

The browser also checks expiration on page load, every 30 seconds, and when a tab
becomes visible. It updates filters, counts and empty states, and promotes the
next published homepage event. This avoids a scheduled rebuild dependency. It
uses the visitor's device clock; paused background tabs update when resumed.
With JavaScript disabled, event cards are hidden and a bilingual instruction is
shown so stale events are not presented as upcoming. New events and edits still
require a rebuild and approved deployment.

## Troubleshooting

- A build error names the event ID and field. Correct that field, then rerun build.
- Missing flyer: verify the exact filename, extension and letter case. GitHub Pages
  filenames are case-sensitive. Do not use absolute paths, URLs or `../` in `image`.
- Missing translation: fill both `es` and `en` with nonempty strings.
- Date error: check calendar date, seconds, New York offset and end ordering.
- Event missing: check status, expiration, category filter and whether you rebuilt.
- Drafts cannot be previewed publicly. Do not publish an unverified test event.
- Browser still shows an old flyer: refresh without cache after rebuilding.
- Port 4173 already in use: stop the earlier development server, then retry.
- Existing legacy `verified: true/false` event records remain readable as
  published/draft when no explicit status exists. Use explicit status for new
  records; remove `verified` when converting an old event to avoid confusion.
  Sermons continue using their existing `verified` workflow.

## Review in Git

Work on a dedicated development branch. The implementation branch is
`development/events-publishing-refactor`. Before creating a later branch, check
that your working tree is clean. For a new approved change, `git switch -c
development/your-event-slug` creates a branch. Use VS Code Source Control to inspect
the diff, stage the event, flyer and generated pages, and make a focused commit.
Do not include local test data. After explicit permission to push, publish that
branch and open a GitHub pull request targeting `main`, with the checks and both
language screenshots. Do not merge or deploy before approval.
