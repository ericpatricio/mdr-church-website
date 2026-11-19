# QA — professional pastoral redesign, October 28, 2026

## Local Sanity POC usability exercise — November 18, 2026

The administrator manually verified bilingual draft preview and exclusion,
publication on both Eventos pages and both homepages, corrected New York times,
unpublished edit isolation, flyer replacement/republish, cancellation display,
homepage exclusion and deletion. All four local listings returned to empty.
An anonymous API check confirmed the published poc feed is empty; the file-based
catalog is empty too. Uploaded test assets were intentionally left intact.

A Chrome fetch receiver bug found during this exercise was reproduced by a
regression test and fixed locally. Website build, static validation, automated
tests and Studio typecheck were rerun after the exercise. This does not establish
full viewport, keyboard, screen-reader or phone coverage. The production website
remains on the separately deployed file-based release; no CMS deployment or
production adoption is authorized by the exercise.

## Final QA corrections — November 17, 2026

The current catalog has four ministries and 20 localized pages. Build/check
messages now calculate the count. Caballeros uses the exact-case logo filename,
descriptive Spanish/English image alternatives, and the existing credited
Bible-study stock photo. The unverified `men-study.jpg` is retained but unused.
Static validation now rejects filename case mismatches and missing/undefined
image alternatives. Edited text files use LF line endings for plain diff checks.

Browser viewport comparisons at 390, 768 and 1440 pixels, actual keyboard and
language-switch interactions, console errors, and screen-reader checks remain
unverified because browser access was unavailable. Historical results below do
not establish that these current browser checks passed.

## Events publishing refactor — November 16, 2026

This section describes the current local development branch; later sections are
historical release evidence. No push, merge or deployment is authorized.

Executed checks:

- `npm.cmd run build`: regenerated all 18 localized pages.
- `npm.cmd run check`: validated 18 pages, local references, image references,
  section anchors, language counterparts, menu semantics and GitHub Pages paths.
- `npm.cmd test`: existing synthetic menu/filter/search tests and catalog tests,
  plus event status validation, duplicate IDs, invalid/missing flyers, bilingual
  fields, unsafe URLs, date ordering, spring-forward gaps, both fall-back offsets,
  expiration boundaries, cancelled registration suppression, homepage selection,
  browser-clock expiration and promotion of a fourth homepage event.
- Populated integration tests run the actual generator and static checker in an
  isolated temporary copy, checking Spanish and English output with published,
  cancelled and draft fixtures. No fixtures enter the public catalog.
- Local HTTP checks returned 200 for all 18 localized pages. The 14 pages outside
  Home and Events match their previous generated content after newline normalization.
- JavaScript syntax checks passed for the generator, event renderer, catalog and
  browser script. Diff whitespace checks passed with CRLF line endings recognized.

Browser DOM access reported that its host was unavailable. A Windows Chrome
fallback was attempted, but Computer Use stopped because it could not determine
the current browser URL confidently enough to enforce policy. No baseline or
after screenshots, visual comparison, browser keyboard test, console inspection,
screen-reader audit or new cross-browser assessment was completed. Synthetic
interaction tests are not represented as browser tests. Manual desktop/mobile
review is still required before release.

The existing approved layout, logo and assets are retained. Flyers use contain
sizing to preserve their text. Expiration depends on the visitor's device clock
and JavaScript, with a maximum active-page interval of 30 seconds; background
tabs refresh when visible. Without JavaScript, cards are hidden and a translated
instruction is displayed. No scheduled rebuild or external integration is added.


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

## Approved visual refresh — November 1, 2026

Owner approved applying the latest MDR visuals while retaining the bilingual site. The homepage now has a 90%-width, 90vh background slideshow beginning with the supplied waterfall image, followed by the supplied worship, intercession and Bible-study images. No previous/next/pause controls are rendered; rotation pauses during hover/focus and is disabled for reduced motion. Navbar logo renders 10% larger. The first-visit invitation uses generated illustrative welcome imagery, not a photo of MDR members.

Build, all 18 bilingual-page link/asset checks, catalog and interaction tests, and JavaScript syntax checks passed. This revision is authorized for merge and deployment by the owner's request in the current chat.

## Targeted mobile, hero and ministry-logo corrections — November 18, 2026

Local changes on development/sanity-events-poc; nothing committed, pushed,
merged or deployed. Existing event/CMS work and production settings preserved.

Changes:
- Full-width hero: removed 90% width, maximum width, rounded card margin and
  fixed viewport height. Content now determines height above responsive minima;
  dedicated bottom space prevents the slide controls overlapping the copy.
- New supplied assets/waterfall-realistic.jpg is the first slide in both languages.
  Existing waterfall asset retained. HTML text, links and other slides preserved.
- Added labelled native previous/next buttons (48 by 48px), visible keyboard
  focus and a polite slide counter. Previous/next wrap around. Autoplay restored at the owner?s request: eight-second rotation pauses on
  hover, keyboard focus, hidden tabs and reduced-motion preference.
  Reduced-motion behavior remains; no swipe handler/dependency introduced.
- Men’s original 960x768 PNG retained. A circular wrapper compensates for its
  transparent padding, preserving the artwork’s aspect ratio and making its
  visible diameter consistent with the other logos. Applied on Home, About,
  Ministries and the men’s detail page in both languages.
- Mobile language targets widened to 44px; ministry copy can shrink/wrap.

Files edited for this task: assets/style.css, assets/app.js, scripts/build.mjs,
scripts/check.mjs, scripts/test-ui.mjs and this QA.md. Generated bilingual index,
nosotros, ministerios and ministerio-caballeros pages were refreshed. The supplied
waterfall image was already present and was not modified.

Verification:
- npm.cmd run build: passed, 20 bilingual pages.
- npm.cmd run check: passed, 802 local references and 142 images; includes new
  checks for first-slide asset, labelled arrows and normalized men’s logo wrapper.
- npm.cmd test: passed all existing suites plus previous/next, wraparound,
  first-slide, photo/announcement-state and eight-second autoplay/pause regressions.
- git diff --check: passed (existing LF/CRLF conversion warnings only).
- Browser automation host unavailable; native Chrome fallback worked using
  responsive emulation at height 844 and widths 390, 768 and 1440 CSS pixels.
- Spanish and English homepages visually inspected at all three widths. At each,
  document scrollWidth equalled innerWidth and hero width equalled viewport width.
  No sampled text overlap/clipping. Both hero action links passed element hit
  checks. Loaded-image checks reported no broken images in sampled views.
- At 390px, native click advanced the slide; Space advanced it again, Shift+Tab
  and Enter activated the previous arrow. White focus outline was visible.
  Announcement and photo transitions retained the hero footprint.
- English ministry cards inspected at all three widths: all four logo frames
  measured 60x60 at 390, 52x52 at 768 and 64x64 at 1440. Men’s artwork visually
  matches their scale without distortion. Spanish uses the same markup/CSS;
  its ministry section was not separately scrolled through at every width.
- Desktop ES-to-EN language navigation passed. English phone menu opened, Escape
  closed it and restored visible focus to its button.
- No application JavaScript errors observed in sampled console reads. One QA
  diagnostic expression was accidentally run on the Visit page, which has no
  hero; its null-reference error was diagnostic-only. The final reloaded Home
  console had zero messages. Chrome’s two pre-existing Issues notices were not
  investigated as part of these targeted corrections.

Remaining manual verification: physical-phone touch activation and landscape
behavior, Safari/iOS and Android browser coverage, screen-reader slide-status
announcements and a complete image-scroll sweep. These are emulated Chrome
results, not physical-device certification. The supplied JPEG is about 2.85 MB;
loading can be slower under throttled mobile networking. It was preserved exactly
as supplied. Existing Sanity preproduction acceptance gaps remain in
SANITY_PREPRODUCTION_QA.md; this task does not grant production approval.

## Hero final polish — November 18, 2026

This entry supersedes the earlier waterfall-size limitation. Original
assets/waterfall-realistic.jpg remains unchanged; derived files only were added.
No ministry-logo rules, event/CMS logic or production configuration were changed.

| Image | Dimensions | Bytes | Reduction from original |
| --- | --- | ---: | ---: |
| Original JPEG (preserved) | 3600x2400 | 2,853,436 | — |
| Mobile WebP | 960x640 | 159,514 | 94.4% |
| Desktop/tablet WebP | 1920x1280 | 621,856 | 78.2% |
| JPEG fallback | 1920x1280 | 583,521 | 79.6% |

Picture markup selects the mobile WebP through 600px, the larger WebP above that,
and an optimized JPEG img fallback for browsers without WebP. Priority loading,
alt text, intentional cover crop and explicit dimensions remain. Original pixels
were resized/compressed locally with a temporary Sharp install outside the repo;
no runtime or package dependency was added. The mobile source is deliberately
bounded at 960px to favor loading speed; high-density phones may show less fine
foliage detail than the original. No real-network timing benchmark is claimed.

Added a native, visibly labelled Pause/Play control (Pausar/Reanudar in Spanish),
104x48 CSS pixels, with localized accessible action labels and visible focus.
Manual pause persists through timer ticks and arrow use. Explicit Play resumes
rotation without moving keyboard focus. Hover pause applies to hover-capable
pointers, avoiding sticky touch hover. Normal focus inside the hero still pauses;
a deliberate Play action permits rotation while that same button retains focus,
until it blurs. Eight-second interval, arrows, slide counter and hidden-tab pause
remain. Reduced motion stops automatic rotation by default; deliberate Play can
opt in, while reduced-motion CSS continues to disable animation. A subsequent
preference change clears that opt-in. Automatic slide changes suppress live
counter announcements; manually paused states retain the polite counter.

Verification:
- Website build: passed, 20 bilingual pages.
- Static validation: passed, including picture variants/fallback, original source,
  localized playback control and existing GitHub Pages path checks.
- Automated tests: passed, including manual pause, arrows while paused, resume,
  eight-second timer, focus/hover/hidden/reduced-motion states, preference changes,
  and explicit touch Play despite sticky hover and retained control focus.
- git diff --check: passed after normalizing documentation line endings.
- Native Chrome fallback worked (browser automation host remained unavailable).
  Spanish and English homepages inspected at 390, 768 and 1440px, height 844.
  In all six cases document scrollWidth equalled viewport width and hero width;
  controls were within the hero and no sampled text overlap was seen.
- Chrome currentSrc confirmed 960 WebP at 390 and 1920 WebP at 768/1440, loaded
  successfully in both languages. Existing hero design/crop remained intact.
- Spanish click, Space and Enter toggled playback with visible focus. Manual Pause
  retained the same slide through an idle timer tick; arrows remained usable.
  After the sticky-hover correction, English phone emulation advanced slides after
  explicit Play even with its button retaining touch focus. Pause/Play labels and
  localized accessible names were visible in the native accessibility tree.
- No application JavaScript error was observed in the sampled hero console views.

Remaining checks: physical iOS/Android touch and Safari, screen-reader spoken
announcements, and actual fallback selection in a browser lacking WebP support.
The fallback file exists and decodes, but this pass used WebP-capable Chrome.
Prior Sanity acceptance gaps remain separate; this does not authorize production.

Files for this polish: assets/app.js, assets/style.css, scripts/build.mjs,
scripts/check.mjs, scripts/test-ui.mjs, generated es/index.html and en/index.html,
three optimized waterfall variants and this report. No commit, push, merge or
deployment was performed.


### Owner follow-up: remove pause/play control

Removed the visible control and its manual playback state from both generated
homepages. Optimized images, arrows, counter and eight-second autoplay remain.
Hover-capable pointer, keyboard-focus, hidden-tab and reduced-motion pauses remain;
reduced motion now has no manual override. Updated regression/static checks pass.
Build, validation, automated tests and git diff --check passed. No new browser
viewport pass was performed for this removal. Nothing committed or deployed.
