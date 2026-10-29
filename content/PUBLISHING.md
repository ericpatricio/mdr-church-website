# Publishing approved church content

The public website remains static and GitHub Pages compatible. This update adds no CMS, database or member account system. Approved records are maintained in content/site.mjs, validated by content/catalog.mjs, and rendered by scripts/build.mjs.

## Events

Add only church-confirmed records. Required properties: id (unique string), verified: true, category (worship or community), start (ISO timestamp including Z or an offset), location, sourceUrl (official HTTPS source), title.es/title.en, description.es/description.en, details.es/details.en. Optional end must follow start; optional image is a local assets-relative filename. Draft records can remain verified: false and are excluded.

The build sorts upcoming events by start time and omits events whose end/start has passed. The homepage shows at most three. The event list has category filters and accessible inline details. Past events are removed on the next build, not by a scheduled service. Rebuild when the calendar changes.

## Messages

Required: id, verified: true, title.es/title.en, speaker, date (ISO date), url (verified HTTPS recording URL). Optional image points to the recording's actual thumbnail inside assets/; optional tags.es/tags.en are arrays of search terms. Drafts are excluded. Latest verified message is featured on the homepage; the library is sorted newest first.

Search appears only when verified messages exist. It matches title, speaker and optional topic tags, ignores case/diacritics, and announces counts and empty results. Do not use stock photography as evidence of a recording or invent a video link.

## Current publication status

No confirmed upcoming special events or verified recordings were supplied. Both arrays intentionally remain empty; no example records are included on the website. Synthetic test records are limited to scripts/test-content.mjs and are never rendered.

## Review steps

Run npm run build, npm run check and npm test. Inspect both languages and new image captions. Push a development branch, request pastoral review, and obtain approval before merge/deployment.
