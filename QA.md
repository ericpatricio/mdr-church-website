# Validation and review record

Current asset redesign:
- Ran node scripts/build.mjs and node scripts/check.mjs successfully: 12 localized pages, 354 local links/asset references and 40 image references.
- Ran node --check assets/app.js successfully.
- Served locally under /mdr-church-website/.
- Browser inspected all 12 pages at widths 1440, 390 and 320 pixels. No horizontal overflow was detected.
- Initial image scan counted offscreen lazy images as pending. After bringing lazy assets into view, all 12 pages reported no failed or pending images.
- Tested mobile menu open and Escape dismissal, visit and event hero anchors, and Spanish-to-English switching retaining the current page.
- Inspected desktop and mobile homepage screenshots. Supporting worship photo uses a CSS crop of the supplied image; no people were generated or altered.

Assets: owner-supplied logo and worship photo are integrated; symbolic spring landscape is labeled AI-generated. JPEG compression reduces the two large PNGs to approximately 527 KB combined. See assets/SOURCES.md.

Remaining limitations: logo and photo are screenshot sources; higher-resolution originals would improve quality. Church history, biographies, ministry details, special events and sermon URLs await official content. Event filtering is not applicable without real records. No full accessibility audit, third-party map destination validation, or deployed GitHub Pages test was performed. Font loads from Google Fonts with a fallback.

No merge or deployment was performed.

## Latest church/Instagram asset verification

Rebuilt after adding the supplied church exterior to Nosotros and Visítanos, Instagram worship photo to the homepage hero, and original ministry/highlight logos. Static checker passed: 12 pages, 364 local link/asset references, 50 image references. Browser loaded all 12 pages at 1440px and 390px widths, scrolled to load supporting images, and reported zero broken/pending images and no horizontal overflow. Confirmed language switch on the ministry page. Original highlight logos are small (150px), and displayed at 100–120px. Church photo is 680 x 510. No publication or merge.
