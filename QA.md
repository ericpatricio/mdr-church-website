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

## Pastoral card update

Nosotros/About now displays two labeled official-photo placeholders: Obispo Raúl Cardona with Pastora Cindy Cardona; Pastor Raúl Cardona Jr. with Pastora Mildred Cardona. English titles are translated. The names/titles were supplied by the owner; no biography or portrait is invented. Browser verified exactly two cards in each language at 1440px and 390px with no horizontal overflow. Rebuild, static checks and generator syntax checks passed.

## Stock imagery and content expansion — October 28, 2026

- Build and static checks passed for 18 bilingual pages, 704 local link/asset references including section anchors, and 114 image references.
- Browser checked all 18 pages at 375, 390, 768, 1024 and 1440px (90 combinations). No horizontal overflow, duplicate main headings or unlabeled stock images were found.
- Scrolled all 18 pages and waited for page loading to settle. No broken or pending images remained.
- Clicked each ministry detail link, switched to its English counterpart and returned to the directory. Tested mobile menu Enter/Escape and detail-page FAQ disclosure. Console error capture was empty.
- Verified that the sermon search control is absent while the approved sermon list is empty, and the Bible image is labeled as stock rather than a recording thumbnail.
- npm test passed: populated/empty event filtering; mobile menu behavior; message search including accented names and no matches; draft exclusion; event expiry/order; sermon ordering; required bilingual fields; unsafe URL/image-path rejection.
- Tests use isolated synthetic records. No invented events or recordings were added to content/site.mjs or generated pages. Real event/sermon publication still requires approved records.
- Four Pexels images were visually inspected and stored locally; visible bilingual labels distinguish them from MDR photos. No stock portraits are attributed to named pastors. Original MDR logo, exterior and worship media remain.
- No framework migration, CMS, database, account system, analytics or payment integration was introduced.

This revision is prepared on development/stock-content-enhancements for review. No merge or deployment performed. Earlier QA sections describe prior revisions, not a claim of current production verification.
