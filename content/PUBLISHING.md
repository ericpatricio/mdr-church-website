# Publishing approved church content

Events are maintained in the `events` array in `content/site.mjs`. Follow
[EVENTS_GUIDE.md](../EVENTS_GUIDE.md) for the complete bilingual, file-based workflow.
Do not create a second catalog or edit generated HTML manually.

## Messages

Messages remain in the `sermons` array in `content/site.mjs` with the existing
`verified: true` publishing flag. Required fields are `id`, bilingual `title.es`
and `title.en`, `speaker`, ISO `date`, and an official HTTPS recording `url`.
An optional `image` is an assets-relative local thumbnail filename; optional
`tags.es` and `tags.en` are arrays of search terms. Unverified records are excluded.

The latest verified recording appears on the homepage. The library sorts newest
first and supports accent-insensitive title, speaker and tag search. No search
control or fake playback is shown while the catalog is empty. Do not use stock
photographs as evidence of an actual recording.

No confirmed special events or recordings are currently supplied, so both public
catalogs remain empty. Test fixtures are isolated from public content.

Run `npm run build`, `npm run check` and `npm test` before review. On Windows
PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`. Push, merge and
deployment require owner approval.
