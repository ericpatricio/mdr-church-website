# QA — professional pastoral redesign, October 28, 2026

## Checks actually run

- npm run build: PASS; regenerated all 12 localized pages.
- npm run check: PASS; 464 local href/src references including fragment destinations, 66 image references, one h1 per page, bilingual counterparts, image dimensions/alt attributes, relative GitHub Pages paths and verified-content constraints.
- node --check on scripts/build.mjs, content/site.mjs, scripts/check.mjs, assets/app.js and scripts/serve.mjs: PASS.
- npm test: PASS; synthetic DOM behavior tests exercise populated/empty event category filtering, row visibility, counts, aria-pressed, mobile menu, Escape, focus return, and breakpoint closing. Synthetic events are test-only and never appear in website content.
- Browser tested all 12 pages at widths 375, 390, 768, 1024 and 1440px (60 page/viewport combinations). No horizontal overflow or multiple h1 elements found.
- Browser scrolled through localized pages to trigger lazy loading. No failed image requests observed. Initially pending offscreen images were loaded by scrolling; all homepage asset sources were subsequently verified loaded.
- Browser clicked all six desktop navigation destinations in each language, mobile ministry navigation, language switches, both hero buttons, and the leadership anchor.
- Browser operated event filters in both languages: category selection, aria-pressed and announced zero-result states updated correctly. No upcoming special events are published.
- Browser keyboard tested menu Enter/Escape with focus restoration, visit hero link with Enter, ministry details and FAQ disclosure with Enter.
- Browser console error capture returned an empty list during local website tests.
- Inspected desktop/mobile homepage screenshots. Saved review screenshots in the task outputs folder.
- Inspected the exact owner-provided Google Maps link in a browser. It resolves to the church listing; address matches the supplied project address, and phone (407) 346-5036 is listed. Directions use that exact short link.

The preview server used /mdr-church-website/ rather than domain-root paths. No package install was required. No lint configuration exists, so no linter result is claimed; syntax and static validation ran instead.

## Review limits

No real event records or sermon URLs were provided. Populated filtering is covered by synthetic behavioral tests, not production event data. No sermon playback/link verification can be performed without official recordings. Ministry descriptions, program ages, schedules and leaders are not inferred. Pastoral names and affiliation come from the attached brief; an identified approved portrait and biography remain pending.

The logo and ministry source images are small; church exterior source is 680 x 510. Fonts depend on Google Fonts, with a system fallback. No full WCAG audit, screen reader audit, Lighthouse performance audit, or cross-browser matrix was performed. Reference-site review used accessible page structures, not a mobile/visual audit of all four sites. Life.Church exposed little readable content.

Phone is sourced to the Google Maps listing; service times and names come from the owner's brief and require final church confirmation. A phone call was not placed. Instagram attribution is grounded in the supplied saved page; no Instagram authentication or private content is used.

This revision is for review only. No merge or deployment was performed.
