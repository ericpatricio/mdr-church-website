# MDR Sanity website release readiness

November 18, 2026. Controlled preparation complete; deployment is not authorized.
The owner approved poc as the intended dataset and the exact non-credentialed
GitHub Pages CORS origin. Both are verified below. No public CMS activation occurred.

## Dataset decision

Approved: retain public dataset **poc** in project **u2olnd8u** for the first
release. Hosted Studio's deployed schema metadata and local config both identify
this target; the website candidate queries the same target. No dataset switch,
creation, deletion or remote content mutation was performed in this stage.

Read-only counts: poc has zero events/drafts and three retained assets;
production has zero events/drafts/assets. The name poc does not impose a technical
restriction. Retention avoids moving the already-confirmed administrator setup.
Its intended production use is approved; website deployment remains separate.

If production is preferred, approve that coordinated change first. Recheck its
contents, export both datasets as backups, and pause editing during cutover. With
both event catalogs still empty, no import or deletion is needed: retain all poc
data/assets, change the local Studio target and website target together, test,
then separately approve Studio redeployment and website release. Future content
migration must copy verified documents AND referenced assets without overwriting
destination IDs; validate counts, translations and asset URLs before cutover.
Never combine feeds from both datasets. Rollback can point both consumers back
to the untouched source dataset.

## Exact local release changes

- assets/cms-config.mjs names the website candidate target. The adapter uses it
  for queries and flyer validation; old POC exports remain compatible.
- assets/cms-ui.mjs shares the existing renderer. assets/cms-poc-ui.mjs retains
  loopback-only POC startup; assets/cms-public-ui.mjs activates only when prepared
  pages contain the explicit public configuration marker. No hostname gate blocks
  GitHub Pages. Ready public views do not show local-test labels.
- scripts/prepare-cms-release.mjs and npm.cmd run prepare:cms copy public assets,
  20 localized pages and the root language redirect into ignored release-preview/.
  Only the four Home/Eventos pages receive CMS startup. Studio/source dependencies
  are excluded; .nojekyll and a target manifest are included. The script rejects
  a mismatched local Studio target and preserves an existing unrecognized folder.
- scripts/test-cms-release.mjs verifies isolation, target agreement, subpaths,
  public startup and bilingual empty/unavailable states. Documentation is updated.

Normal npm.cmd run build remains file-based, with content/site.mjs events=[].
Root generated pages, Studio config/dataset, approved CSS, navigation, men's logo
and hero implementation were not changed by this stage. Earlier uncommitted
refactor, hero/image, ministry and Studio work remains in development/sanity-events-poc.
That broader branch diff still needs release review; do not commit it blindly as
if this stage contained only CMS changes. No .github workflow exists in this checkout.

## Integration audit

Public API requests omit credentials/tokens, use perspective=published and exclude
draft/version IDs. Validation checks bilingual fields, unique slugs, UTC instants,
New York timezone, category, state, venue/address, HTTPS links and project/dataset
flyer URLs, MIME and 5 MB size. Rendering escapes content. An invalid response is
rejected as a whole, with event/field diagnostics in console; visitors receive an
unavailable/stale message rather than partially trusted content.

Category filtering remains bilingual. Cancelled events stay labelled on Eventos
until expiry and are excluded from Home. End time is the expiration boundary;
without an end, the event expires at its start. UTC comparisons and New York Intl
formatting handle DST. Unchanged card DOM/focus/details survive refresh.

Visible tabs fetch every 60 seconds, with a ten-second UI/expiry tick. Failures
back off 30/60/120 seconds. A prior validated result remains with a stale warning
for less than five minutes; then cards are cleared and an unavailable message is
shown. A first-load failure immediately becomes unavailable. No persistent cache
or merge with the file catalog occurs. Regular services/navigation remain usable.
Without JavaScript, the existing explanatory message/file-based empty state remains.

## Security review and applied remediation

Baseline npm audit --omit=dev: **2 high, 14 moderate, 0 critical**.
After remediation: **0 high, 13 moderate, 0 critical**. Audit still exits nonzero
for the residual moderates; it is not a clean/zero-vulnerability audit.

The following two exact, same-major fixes were verified in an isolated copy first,
then applied using npm's supported overrides mechanism scoped specifically to
**@vercel/frameworks@3.29.0**. No direct dependency, major version, Sanity version,
framework version or hosted deployment changed. No force fix was run.

| Package and baseline path (under studio/) | Baseline severity | Applied fix / outcome |
| --- | --- | --- |
| node_modules/js-yaml 3.13.1 | High | Updated to 3.15.2; [prototype pollution](https://github.com/advisories/GHSA-mh29-5h37-fv8m) and [merge CPU findings](https://github.com/advisories/GHSA-2883-xcg3-v3hh) cleared |
| node_modules/@vercel/frameworks/node_modules/smol-toml 1.5.2 | High | Removed old nested copy and deduplicated to existing 1.9.1; [malformed input](https://github.com/advisories/GHSA-7w5x-hrqm-74c2) and [quadratic parsing](https://github.com/advisories/GHSA-r4xh-jqrq-34v2) findings cleared |
| node_modules/@vercel/frameworks 3.29.0 | Moderate, inherited | Cleared after both parser fixes; its version is unchanged |

Only those two parser entries changed in package-lock.json. The parent still has
old exact pins upstream: this is a tested local override, not an upstream claim
that Vercel changed or certified its pins. Scoping it to the exact parent version
avoids silently forcing these versions into a future framework release.

Isolation evidence: parser versions, actual readConfigFile YAML/TOML/JSON reads,
missing/invalid-file handling, Hugo publishDir and Jekyll destination consumers,
TOML malformed-input timeout and YAML merge-budget regression tests passed.
The patched TOML parser returns null-prototype maps; the real consumers' property
access was checked explicitly. Studio build/type-check/semantic tests passed in
the isolated copy and working Studio. The durable compatibility test is now part
of npm.cmd test in studio/. Baseline manifests remain in the ignored trial folder.

Residual moderate entries are listed below. Every path is relative to
studio/node_modules/. These are 13 dependency entries, not 13 independent root
vulnerabilities; they trace to the same remaining minimatch advisory.

| Package / installed version | Path | Applicable fix |
| --- | --- | --- |
| minimatch 10.2.6 | minimatch/ | [Glob amplification](https://github.com/advisories/GHSA-g3hv-75wg-m249); patched 11.0.1+, no patched 10.x listed |
| @oclif/core 4.14.0 | @oclif/core/ | Parent uses ^10.2.5; a major update is outside authorization |
| @oclif/plugin-help 6.3.0 | @oclif/plugin-help/ | Inherited CLI-chain finding |
| @oclif/plugin-not-found 3.3.0 | @oclif/plugin-not-found/ | Inherited CLI-chain finding |
| @sanity-labs/oclif-plugin-skills-flag 0.2.1 | @sanity-labs/oclif-plugin-skills-flag/ | Inherited CLI-chain finding |
| @sanity/blueprints 0.33.0 | @sanity/blueprints/ | Inherited CLI-chain finding |
| @sanity/cli 8.30.0 | @sanity/cli/ | Inherited CLI-chain finding |
| @sanity/cli-build 7.2.2 | @sanity/cli-build/ | Inherited CLI-chain finding |
| @sanity/cli-core 3.15.1 | @sanity/cli-core/ | Inherited CLI-chain finding |
| @sanity/runtime-cli 17.21.5 | @sanity/runtime-cli/ | Inherited CLI-chain finding |
| @sanity/workbench-cli 2.17.0 | @sanity/workbench-cli/ | Inherited CLI-chain finding |
| @sanity/workflow-cli 0.37.0 | @sanity/workflow-cli/ | Inherited CLI-chain finding |
| sanity 6.24.0 | sanity/ | Inherited CLI-chain finding |

CLI 8.31.0 still uses core ^4.14.0; frameworks 3.35.0 retains its old parser pins.
Neither provides a supported in-range minimatch fix. Core 5.1.12 uses ^11.0.1,
but that parent upgrade and a forced minimatch override cross major boundaries.
They were not applied. npm audit fix --force's Sanity 6.1.0 downgrade was rejected.

Residual risk is CLI/build-process denial of service with attacker-controlled glob
patterns. Avoid running this toolchain against untrusted inputs. The static website
has no npm dependency runtime and its artifact excludes Studio/node_modules.
Prior source-map inspection found none of these parsers in the browser bundle.
That does not make the local tooling advisory disappear; accept the documented
residual risk or authorize a separate major-upgrade investigation before release.

## Tests and review

Passed: website build (20 pages), static validation, full automated suites including
new release tests, Studio build/type-check/tests, and git diff --check.
An in-memory session-token/pattern scan is rerun after the final build, including
the release artifact; final results are recorded in the controlled-pass summary below.
Five live GitHub Pages page hashes matched the saved baseline and remain file-based.
Prepared artifact passes the same static checker with 806 local references and
142 images. Tests cover published-only isolation, bilingual populated fixtures,
filtering, cancellation, expiry/DST, refresh focus/disclosures and outage recovery.
All fictional fixtures stay local; no Sanity events were created or published.

Native Chrome inspected all four staged Home/Eventos pages at 390, 768 and 1440px
(height 844, scale 1). No measured document overflow or broken loaded images;
each page read poc successfully and displayed its translated empty state.
Language switching, internal Home navigation, mobile menu/Escape/focus return,
Spanish category selection, hero autoplay and keyboard arrows were checked.
No application console error was observed in sampled views. Offscreen lazy images
were not exhaustively scrolled. Physical phones, Safari, actual screen-reader
output, populated-card viewport coverage and visual stale-state transitions remain
manual acceptance gaps. Browser automation host was unavailable; native fallback worked.

## Preview, approval and deployment steps

1. In VS Code at repository root: npm.cmd run build; npm.cmd run check; npm.cmd test;
   npm.cmd run prepare:cms. Start npm.cmd run dev if no server already owns 4173.
   Open http://127.0.0.1:4173/mdr-church-website/release-preview/es/index.html and
   the en/index.html, es/eventos.html, en/eventos.html counterparts. This is the
   isolated release artifact, not the normal file-based output.
2. Completed under explicit approval: retain poc and add the exact CORS origin
   **https://ericpatricio.github.io**, **credentials disabled**, no path or wildcard.
   The anonymous published-event API probe now returns HTTP 200, an empty result,
   Access-Control-Allow-Origin matching that exact origin, and no credential grant.
   A configuration read confirms allowCredentials=false. No other origins changed.
   Keep the hosted Studio's credentialed origin unchanged; no browser token is needed.
3. Complete/accept remaining manual tests and the documented residual CLI risk.
   Recheck raw dataset counts and independently verify hosted Studio still targets poc.
4. Obtain separate approval to commit/review/merge and deploy. Confirm the existing
   Pages source in repository settings. Use an isolated release branch/worktree;
   preserve the default file-based snapshot and copy ONLY release-preview contents
   to the approved Pages document root. Do not upload Studio, node_modules, secrets
   or the parent workspace. Publishing needs no paid service or frontend framework.
5. After the approved deployment, test both languages on the actual Pages origin,
   CORS/anonymous published feed, expiry/filters/navigation/hero and rollback.

Steps 1–2 are complete; steps 3–5 still need separate release authorization. The
only remote configuration change was the approved non-credentialed CORS origin.
No Studio deployment, dataset changes, main-branch edits, commits, pushes, merges
or Pages deployment occurred.

## Rollback

Keep the current empty content/site.mjs catalog and file-based generator. Generate
normal pages with npm.cmd run build and validate with npm.cmd run check / npm.cmd test.
For an approved rollback deployment, restore the four normal Home/Eventos HTML files
without CMS startup, or redeploy the saved file-based snapshot as a unit. Dormant
CMS asset files can remain; removing their bootstrap stops all website CMS reads.
Do not delete Sanity records, assets, datasets or Studio. Rollback deployment still
requires authorization; it is not an action performed by this preparation script.

## Controlled-pass summary for final release authorization

The only remote change in this pass was adding exactly
https://ericpatricio.github.io to project u2olnd8u with allowCredentials=false.
Configuration verification found one exact entry, no wildcard and no other origin
changes. An unauthenticated GET using the website candidate's actual query returned
HTTP 200, result=[], matching Access-Control-Allow-Origin and no credential grant.

Deployed schema metadata still reports project u2olnd8u, dataset poc. Local CLI and
release-preview/RELEASE_MANIFEST.json agree. Public website queries explicitly use
perspective=published and exclude draft/version IDs; Studio editing intentionally
retains authenticated draft access. Both datasets remain intact, with zero event
documents/drafts; three existing poc assets were retained.

Exact source files changed in this controlled pass:

- studio/package.json: exact-parent-scoped parser overrides and compatibility test command.
- studio/package-lock.json: js-yaml 3.13.1 -> 3.15.2; removed the old nested
  smol-toml 1.5.2 entry, reusing existing 1.9.1. All other lockfile package entries
  are byte-equivalent as parsed JSON; no direct dependency or major upgrade.
- studio/scripts/test-dependency-compat.mjs (new): real framework-reader/consumer
  compatibility checks and bounded parser security regressions.
- SANITY_RELEASE_READINESS.md: approved decisions, evidence, security outcomes and gates.

Ignored local outputs regenerated: release-preview/, studio/dist/, and the isolated
trial/evidence scripts under studio/.sanity/. Existing uncommitted work was preserved;
86 existing non-Studio files (excluding this report) have unchanged hashes.

Final checks passed:

- Website build, static validation (20 pages, 802 references, 142 images), full tests.
- npm.cmd run prepare:cms; isolated artifact static validation (806 references).
- Studio build, type-check, semantic field tests and new dependency compatibility tests.
- Credential scan: 446 source/build text files, no token/pattern leaks or source maps.
- git diff --check.
- Five existing live page hashes unchanged; live website still uses the file catalog.

The audit result is 0 high / 13 moderate / 0 critical. Its nonzero exit is expected
for the remaining minimatch chain and is not reported as a clean security audit.
The earlier twelve Chrome page/viewport checks remain the visual evidence; this
pass changed only Studio tooling and CORS, verified unchanged website hashes, and
did not repeat the browser matrix or claim physical-phone/screen-reader coverage.

Remaining release gates: explicit acceptance of residual CLI risk (or separate
authorization for a major-upgrade investigation), completion/acceptance of the
manual checks above, review of the broader pre-existing branch changes, and
separate commit/push/merge/deployment authorization. No dataset decision or CORS
change remains pending. No public activation, commit, push, merge, main change,
Studio redeployment, dataset migration or paid upgrade was performed.


## Controlled versioning audit ? 2026-11-19

See [RELEASE_COMMIT_PLAN.md](RELEASE_COMMIT_PLAN.md) for the exact 51-file allowlist, full 13-entry advisory path table, exclusions and rollback commit strategy. Website/Studio builds, validation, tests, full security audit review, credential scan (447 text files), raw dataset check and git diff --check were repeated. Both event catalogs remain empty; hosted schema/candidate target u2olnd8u/poc; five live Pages hashes and 86 existing local website file hashes remain unchanged. No source/dependency changes were needed in this pass.

Additional release gates: assemble from verified current remote main (6cf697c58b8d4c56a6439bc8cb6c505dc39b76fb), because the working branch is older; retain newer remote pastoral presentation documents; exclude undocumented unused men-study.jpg and historical verify-live.mjs. The existing preview copier currently includes the unused photo, so that artifact is not approved for deployment. Preserve all originals locally. Residual risk is 13 moderate CLI/build dependency findings with no verified compatible in-range fix, zero high/critical findings. No staging, commits, push, merge, deployment, main modification, dataset mutation or new remote configuration change occurred. Final clean-worktree smoke testing, physical-phone and screen-reader acceptance remain outstanding.


## Clean release candidate assembly - 2026-11-19

Assembly completed locally under the owner's controlled release-candidate authorization. The documented 13 moderate local CLI/build advisories are temporarily accepted for release preparation ONLY. No commit, staging, push, merge, deployment, main-branch change, remote configuration change or dataset mutation occurred.

### Exact base and workspace

- Original development HEAD and unchanged local main: 2f40ac596498be7f15c5a75ded81655443cc357f.
- Original origin/main before fetch: 6cf697c58b8d4c56a6439bc8cb6c505dc39b76fb.
- Fetched remote main and exact new release base: 6cf697c58b8d4c56a6439bc8cb6c505dc39b76fb (Merge file-based pastoral review release).
- Candidate branch: release/sanity-candidate-20261119.
- Candidate worktree: C:\Users\ericw\AppData\Local\Temp\mdr-clean-release-20261119.
- Separate local evidence directory: C:\Users\ericw\AppData\Local\Temp\mdr-release-evidence-20261119 (not part of the release).

The remote commit did not advance since the reviewed manifest, so there was no new upstream divergence to resolve. Inspected the source deltas against that exact main, retained current main's pastoral presentation documents and inherited event guide/catalog/assets, and transferred 43 allowlisted source/artwork/documentation inputs. Did NOT copy the eight allowlisted generated HTML files: rebuilt all 20 routes from reconciled source. The eight changed outputs matched approved source rendering with CRLF normalized. Twelve regenerated pages with identical baseline content were normalized to checkout CRLF after verification to avoid unrelated line-ending-only changes. This did not change their content. No source conflicts were identified; no major architecture decisions were improvised.

Original-workspace preservation check: all 100 tracked/nonignored source file hashes, exact porcelain status, HEAD, local main and every pre-existing local branch tip match their before-assembly snapshot. Existing pastoral worktree was not touched. Only a new release branch/worktree and authorized fetch metadata were created.

### Reconciled resulting manifest

Exactly 51 source files: 20 modifications and 31 additions relative to the fetched base; zero removals. The path allowlist is unchanged from RELEASE_COMMIT_PLAN.md. Candidate SANITY_RELEASE_READINESS.md alone gains this assembly addendum; original documentation is untouched. All other transferred input bytes match the approved source. Exact per-file SHA256 values and add/modify classification are saved outside the candidate in reconciled-manifest.json in the evidence directory.

```text
.gitignore
CMS_POC_GUIDE.md
QA.md
README.md
RELEASE_COMMIT_PLAN.md
SANITY_PREPRODUCTION_QA.md
SANITY_RELEASE_READINESS.md
assets/app.js
assets/cms-config.mjs
assets/cms-events.mjs
assets/cms-poc-ui.mjs
assets/cms-public-ui.mjs
assets/cms-ui.mjs
assets/event-model.mjs
assets/event-refresh.mjs
assets/event-rendering.mjs
assets/style.css
assets/waterfall-realistic-1920.jpg
assets/waterfall-realistic-1920.webp
assets/waterfall-realistic-960.webp
assets/waterfall-realistic.jpg
content/catalog.mjs
en/index.html
en/ministerio-caballeros.html
en/ministerios.html
en/nosotros.html
es/index.html
es/ministerio-caballeros.html
es/ministerios.html
es/nosotros.html
package.json
scripts/build.mjs
scripts/check.mjs
scripts/event-rendering.mjs
scripts/prepare-cms-release.mjs
scripts/serve.mjs
scripts/test-cms-release.mjs
scripts/test-cms.mjs
scripts/test-ui.mjs
scripts/test.mjs
studio/components/ConditionField.tsx
studio/components/EventPreview.tsx
studio/env.d.ts
studio/package-lock.json
studio/package.json
studio/sanity.cli.ts
studio/sanity.config.ts
studio/schema/event.ts
studio/scripts/test-condition.mjs
studio/scripts/test-dependency-compat.mjs
studio/tsconfig.json
```

Excluded from this worktree: assets/stock/men-study.jpg, studio/scripts/verify-live.mjs, original remediation sandbox, original caches, local environment files and credentials. No original file was deleted. The undocumented photo is also absent from the newly generated release-preview artifact, resolving the earlier packaging blocker for THIS clean assembly. The general copier still copies assets present in its input workspace: rebuild release artifacts only from this approved clean workspace; do not regenerate a deployable artifact from the original dirty workspace with the excluded photo present.

Fresh node_modules, Studio dist, generated schema/cache and a new ignored read-only verification script were created only as local verification outputs; they are excluded by .gitignore. release-preview is also ignored. None belongs in a commit. No mutation fixture or fictional event was created/published/uploaded during assembly.

### Checks completed

| Check | Result |
| --- | --- |
| Website build | PASS: all 20 bilingual routes regenerated |
| Website static validation | PASS: 802 local references, 142 images, navigation/language semantics, links/fragment targets and content constraints |
| Automated website tests | PASS: mobile menu, filtering/search, hero arrows/eight-second autoplay/hover-focus-hidden-reduced-motion pauses; event states/expiry/DST; CMS normalization/draft isolation/cancel/outage/refresh identity/focus/details; release bootstrap/path isolation |
| prepare:cms | PASS: ignored local-only candidate created; normal Home/Eventos remain file-based |
| Candidate static validation | PASS: 806 local references, 142 images; undocumented photo absent |
| HTTP route sweep | PASS: all six main pages and four ministry pages in each language (20 HTTP 200 responses), matching generated files |
| Studio locked install | PASS: npm ci, 923 packages; no lockfile update or new dependency override |
| Studio build / typecheck / tests | PASS: static build, tsc --noEmit, semantic radio-group/error association tests and actual parser compatibility/security regressions |
| Fresh installed dependency audit | 0 critical / 0 high / 13 moderate; expected audit exit 1 reviewed and temporarily accepted for this preparation |
| Credential scan | PASS: source/Studio build/candidate text scanned for current session token and known private-key/GitHub/OpenAI credential patterns; no matches; no source maps |
| Git/manifest whitespace | PASS: git diff --check and all 46 allowlisted text files, no conflict markers/trailing whitespace; index empty |
| Approved artwork | PASS: original waterfall, all optimized variants and men's original PNG identical to original source bytes |
| Live website preservation | PASS: five previously recorded GitHub Pages page hashes unchanged; no public deployment performed |
| Dataset/configuration | PASS: authenticated raw poc event count zero, file events empty; hosted schema and local CLI/artifact agree on u2olnd8u/poc |
| Anonymous published request | PASS: actual public query HTTP 200, result=[], perspective=published; approved GitHub origin allowed, credential grant disabled |

The credential scanner was rerun after this addendum; final count/results are recorded in the separate evidence report. Pattern scanning cannot guarantee detection of every possible secret format.

### Browser evidence and limits

Browser access host reported unavailable. Native Chrome fallback was available and used on the freshly rebuilt file-based candidate at http://127.0.0.1:4186/mdr-church-website/ with Chrome responsive emulation, widths 390, 768 and 1440, height 760 (first mobile observation used 1007 before changing height), fit-to-window scaling and an existing Slow 4G setting. Spanish and English Home and Eventos were inspected at each width: twelve page/width combinations. Header, visible hero or page heading, visible controls and event empty/filter areas showed no obvious overlap or broken layout in those inspected regions. The mobile menu opened and an Eventos link navigated successfully; Spanish/English language links switched to the corresponding page. Hero counter advanced through slides, supplied waterfall and announcement/worship imagery rendered, and next control was exercised. English mobile service/community sections were also spot-checked. These are visual observations, not measured full-page overflow results or a complete accessibility certification.

The CMS-enabled local artifact at port 4185 received the EXPECTED CORS denial: that temporary local origin is not approved. No CORS settings were expanded, and no security barrier was bypassed. This is a local test-origin limitation, not a failed approved-origin query. Published-only GitHub-origin requests passed independently; CMS rendering/filter/refresh/outage behavior passed local automated fixtures. For an interactive CMS browser smoke test, run this clean candidate on the already-approved http://127.0.0.1:4173 after the owner stops the existing preview using that port. The original preview listener was preserved. Do not claim a populated CMS browser pass on 4185.

Remaining manual acceptance gaps: full-height measured overflow and image sweep across all 20 pages/three widths; visual ministry logo/detail-page inspection on a physical phone; populated CMS cards and actual keyboard focus/expanded details through live browser refresh on the approved local origin; keyboard-only interaction in a real browser (automated model passed); physical iOS/Android touch; screen-reader announcements/validation; candidate Studio interactive form/upload/publish test (static/type/semantic tests passed, prior hosted administrator exercise remains historical acceptance). No real or fictional remote event was created to fill these gaps. No new observed design regression was found in inspected regions, but these unverified checks remain open.

### Review and rollback

Open this worktree in VS Code using File > Open Folder. For the normal file-based website use the running 4186 preview, or npm.cmd run dev after stopping any existing process on its default 4173 port. For CMS smoke testing use npm.cmd run prepare:cms then serve the generated release-preview directory with the existing scripts/serve.mjs on approved 127.0.0.1:4173; do not activate root HTML or deploy it. Studio local review uses npm.cmd run dev from studio only after freeing the existing 3333 listener; no second login/account/service is created by assembly.

Root pages retain the empty file catalog and contain no CMS bootstrap. A future separately authorized CMS activation should be its own commit containing the four Home/Eventos bootstrap changes. Rollback should be a new revert commit of that activation (or rebuild normal file-based pages, validate and independently authorize deployment), preserving the Studio and Sanity data/assets. No history reset or dataset deletion is needed. No rollback command was executed.

Assembly blockers: no source conflict, missing approved asset, new high/critical finding or failed required automated check. Remaining release gates are the manual acceptance gaps above and separate explicit authorization for committing, pushing, merging, CMS activation and deployment. Temporary moderate-risk acceptance applies to preparation only and does not grant production-risk acceptance.


## Final release candidate verification - 2026-11-19

Verification completed locally. No commit, staging, push, merge, deployment, main-branch modification or public CMS activation. No website/Studio implementation code was changed during this verification. This readiness addendum is the only tracked-source content update in this pass; new test tools/evidence are ignored or outside the release worktree.

### Stable preservation

Git moved the accepted worktree from Windows Temp to C:/Users/ericw/Desktop/MDR-website/mdr-release-candidate using git worktree move. Branch identity remains release/sanity-candidate-20261119 and HEAD/base remains 6cf697c58b8d4c56a6439bc8cb6c505dc39b76fb. All 98 candidate tracked/nonignored file hashes and status matched immediately after the move. All 100 original development file hashes, its branch/status/HEAD and existing branch tips were preserved. Original local main stays 2f40ac596498be7f15c5a75ded81655443cc357f. No original source workspace or pastoral worktree files were moved or reset.

Evidence now lives at C:/Users/ericw/Desktop/MDR-website/release-evidence-20261119; all eight pre-existing evidence files were copied byte-for-byte and the original Temp evidence is retained as a backup. Historical assembly sections above refer to the old path; this section supersedes those location and browser-coverage gaps.

### Actual CMS/browser results

The browser access host was unavailable and the native Chrome fallback failed activation twice. Verification therefore used installed Chrome 157.0.8103.79 in headless mode with isolated profiles, normal browser security/CORS and the official DevTools protocol. No dependency, framework, service, login bypass or browser write credential was introduced. [Chrome headless reference](https://developer.chrome.com/docs/automation-and-testing/headless/).

- Actual CMS-enabled release-preview was served only at http://127.0.0.1:4185/mdr-church-website/.
- Added only that exact loopback CORS origin with credentials disabled. Actual anonymous browser API requests used perspective=published, excluded drafts/versions and sent no Authorization/Cookie header. Dataset/project remained u2olnd8u/poc. Hosted Studio dataset/configuration was unchanged.
- Four future fictional published records, one expired published record and one draft were created with a unique ledger namespace and a unique abstract PNG test flyer. No real content was created or modified. The initial published response contained five records; all public sections excluded the draft and the past event.
- Spanish/English Home showed the earliest three of four eligible events; Eventos showed all four in chronological order. Flyer intrinsic dimensions 360x480 and displayed card/image bounds passed. Both category filters worked via trusted Space key input at all widths.
- Normal unchanged 60-second network refresh retained exact card identity, focused summary and expanded details. Published cancellation showed its badge without disturbing another focused card; a meaningful title edit replaced only the affected card and kept its expanded details. Published deletion removed the intended card. A real-clock expiration removed the timed card at the existing 10-second UI tick; natural 60-second network refresh and configured intervals were unchanged. All four localized public sections were rechecked after edits/cancellation/deletion/expiration.
- No browser runtime/network errors or private API headers were observed in the completed main, supplemental or empty-state suites.

### Responsive and accessibility evidence

- Twenty routes (six main pages plus four ministry detail pages in each language) at 390, 768 and 1440 CSS pixels: 60 complete page measurements. A supplemental pass measured max(root/body scrollWidth) against documentElement.clientWidth to account for desktop scrollbars; all 60 passed. Loaded images, card bounds, flyer aspect sizing and footer presence passed. Full-page Home/Eventos and ministry screenshots are in the evidence directory; representative screenshots were visually inspected, including the original men's logo and waterfall hero.
- Trusted browser keyboard input verified menu Enter/Escape and focus return, language navigation, Tab focus, Space filter selection and native Enter disclosure toggling. Visible focus outlines were present. Browser touch emulation closed the menu successfully.
- Hero next control, eight-second autoplay resumption, focus pause and reduced-motion pause passed in a real browser. Existing automated tests also cover hover/hidden-state behavior. Original artwork, optimized picture variants, previous/next arrows and counter remain unchanged; no pause/play control was reintroduced.
- Chrome's native accessibility tree exposes named category buttons, event disclosure names and expanded state, image alternate text and main/footer landmarks. This is basic semantic verification, NOT a screen-reader speech test or formal accessibility certification.
- Real Safari/WebKit, physical iOS/Android, actual VoiceOver/NVDA/TalkBack, zoom/large text and assistive-technology validation announcements still require manual acceptance. Studio build/type/semantic tests passed; this pass did not repeat interactive Studio uploads/publishing, already exercised in the prior administrator test.

Initial diagnostic-only failures were in external test tooling: Enter lacked its character event (corrected; trusted keypress/click then passed), and the CORS comparison assumed string IDs although the API returns numeric IDs (corrected; exact baseline comparison then passed). The initial failed keyboard evidence is retained. Neither required product source changes or concealed a product regression.

### Cleanup and integrity

Cleanup was scoped to session mdr-rc-qa-4d6779fd-9105-41b8-a138-f27e3d25b0a7. Fictional C was deleted as part of the deletion test; the remaining five event documents (including the session draft) and unique unreferenced test image image-bbcdcffcc919aee03b97554d8777b4025703943d-360x480-png were removed during cleanup. Existing assets were not deleted or replaced. Authenticated raw event count and anonymous published feed are zero; original asset IDs match the baseline exactly. The temporary local CORS entry was removed; all original origin entries/credentials settings match the baseline exactly. Cleanup verification completed 2026-11-19T16:26:25.676Z.

After cleanup, the actual CMS-enabled browser showed empty Home/Eventos sections in both languages at 390/768/1440 (12 checks), with no fictional text, no overflow and no runtime/network errors. Temporary-origin browser testing finished before origin removal. Subsequent CMS preview must use the already-approved http://127.0.0.1:4173 after freeing that port, or a separately authorized temporary origin. No temporary origin remains enabled.

Final checks passed: website build/static validation/full automated tests; local prepare:cms and artifact validation; Studio build/typecheck/tests; credential/public configuration scan; dependency audit review; git diff --check and untracked allowlist whitespace/conflict-marker checks. Static counts remain 20 pages / 802 references / 142 images, artifact 806 references. The root Home/Eventos pages contain no CMS bootstrap and retain the empty file-based catalog; the CMS artifact remains ignored. Undocumented men-study.jpg, historical verify-live.mjs and original remediation/cache/env/credential files remain excluded. Original and optimized waterfall assets and supplied logos remain byte-identical.

The audit is 0 critical / 0 high / 13 moderate (accepted only for preparation). These are the previously documented minimatch local CLI/build dependency chain. No force update, package change or new override was applied. Credential scanning found no current session token/private-key/GitHub/OpenAI token-pattern leak in 446 source/build texts; no source maps were generated. Pattern scans do not prove absence of every possible secret format.

### Remaining issues by severity

- Critical: none observed.
- Major - accessibility design limitation: automatic hero slides have no persistent user pause/stop mechanism, following the owner's earlier explicit removal request. Keyboard focus and reduced-motion pauses work, but focus-only pausing does not satisfy the persistent control requirement described by [WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html). This is a known requested behavior, not a new CMS regression; do not claim WCAG conformance or reintroduce controls without a separate owner decision.
- Moderate security residual: the 13 local tooling findings remain scoped to preparation-only acceptance; production acceptance/remediation decision is separate.
- Minor presentation: full start/end date ranges plus the timezone wrap into dense narrow columns in small/medium event cards. No measured overflow or overlap was found, but a later targeted readability improvement is advisable. No CSS redesign was made in this verification.
- Manual acceptance gaps listed above remain unverified, rather than reported as passed.

No functional CMS regression, unexpected data modification, missing approved asset or new high/critical finding was observed. Formal accessibility acceptance remains open because of the Major limitation and manual gaps. Deployment is not authorized.

### Exact proposed commit boundaries (not executed)

The path allowlist remains exactly 51 files (20 modified / 31 new); no new source paths were added. Final per-file hashes are in final-reconciled-manifest.json and exact non-overlapping commit groups in proposed-commit-boundaries.json in the stable evidence directory.

#### Proposed commit 1: Add shared event rendering and Spanish-first Sanity Studio (16 files)

Shared model/renderer and compatibility proxies travel with Studio, whose preview imports the shared renderer. Includes the reviewed dependency remediation and Studio tests.

```text
.gitignore
assets/event-model.mjs
assets/event-rendering.mjs
content/catalog.mjs
scripts/event-rendering.mjs
studio/components/ConditionField.tsx
studio/components/EventPreview.tsx
studio/env.d.ts
studio/package-lock.json
studio/package.json
studio/sanity.cli.ts
studio/sanity.config.ts
studio/schema/event.ts
studio/scripts/test-condition.mjs
studio/scripts/test-dependency-compat.mjs
studio/tsconfig.json
```

#### Proposed commit 2: Prepare opt-in CMS website integration and approved responsive hero (29 files)

Website bootstrap, reconciler, build/preparation, regression tests and regenerated pages stay together. Normal output remains file-based; CMS activation is excluded.

```text
assets/app.js
assets/cms-config.mjs
assets/cms-events.mjs
assets/cms-poc-ui.mjs
assets/cms-public-ui.mjs
assets/cms-ui.mjs
assets/event-refresh.mjs
assets/style.css
assets/waterfall-realistic-1920.jpg
assets/waterfall-realistic-1920.webp
assets/waterfall-realistic-960.webp
assets/waterfall-realistic.jpg
en/index.html
en/ministerio-caballeros.html
en/ministerios.html
en/nosotros.html
es/index.html
es/ministerio-caballeros.html
es/ministerios.html
es/nosotros.html
package.json
scripts/build.mjs
scripts/check.mjs
scripts/prepare-cms-release.mjs
scripts/serve.mjs
scripts/test-cms-release.mjs
scripts/test-cms.mjs
scripts/test-ui.mjs
scripts/test.mjs
```

#### Proposed commit 3: Document release readiness and maintenance evidence (6 files)

Guides, historical QA and final readiness evidence. No runtime activation.

```text
CMS_POC_GUIDE.md
QA.md
README.md
RELEASE_COMMIT_PLAN.md
SANITY_PREPRODUCTION_QA.md
SANITY_RELEASE_READINESS.md
```

Keeping the shared model/renderer with Studio makes its preview dependencies explicit; website integration/tests and regenerated outputs stay together in the second group. These are proposed review boundaries, not a claim that separate commits have already been made or individually built.

Future public CMS activation remains a separately authorized fourth commit/change, containing the four Home/Eventos public bootstrap changes. Rollback should revert only that future activation commit or rebuild the normal empty file-based pages, validate, and separately authorize deployment. Do not reset history or delete Sanity datasets/assets. All remote dataset/configuration changes in this exercise were temporary and fully restored.


## Final hero accessibility correction - 2026-11-19

Current outcome: the previously reported Major hero pause-control issue is resolved in the isolated release candidate. The Minor dense event-date wrapping issue is also corrected. This addendum supersedes those findings in the earlier final verification section; it does not claim complete site-wide WCAG conformance.

Branch remains release/sanity-candidate-20261119 at base 6cf697c58b8d4c56a6439bc8cb6c505dc39b76fb, stable workspace C:\Users\ericw\Desktop\MDR-website\mdr-release-candidate. Nothing was staged, committed, pushed, merged or deployed. The original development workspace was not edited. No Sanity content, CORS origin, dataset, service or dependency was changed in this correction.

### Targeted changes

- A minimal 16px SVG pause/play icon sits in a matching 48x48 circular button beside the existing hero arrows/counter. It retains existing colors, contrast, border and visible keyboard focus treatment without a large text button. Its descriptive action label/title is localized: Pausar/Reanudar presentacion (accented in the actual interface) and Pause/Resume slideshow.
- Manual pause is independent of temporary automatic pauses. It persists until the visitor explicitly resumes, even after leaving the hero, using arrows or changing motion preference. A single non-sensitive sessionStorage flag retains the choice across reloads and language navigation in the same tab. If storage is blocked, in-memory pause/resume still works for the current page; cross-navigation persistence then cannot be retained. This is not cross-device or permanent storage.
- Explicit resume re-enables the unchanged eight-second interval. Hover on hover-capable devices, keyboard focus within the hero, hidden tabs and reduced-motion preference still take precedence. Play does not override reduced motion; keyboard focus may continue to pause temporarily until the visitor moves focus out of the hero. Slide announcements remain quiet during autoplay and polite when manually paused/reduced-motion is enabled.
- With JavaScript disabled the new control remains hidden and autoplay does not run. Existing arrows/counter, supplied/optimized waterfall, responsive hero, ministry-logo treatment and branding remain intact.
- Event date metadata now uses normal inline text flow with the existing accent line, instead of treating start/end times as separately shrinking flex columns. Event data, date formatting, timezone, filtering, expiry and card layout are unchanged. Date ranges wrap naturally in both languages without horizontal overflow.

### Verification

Passed website build, static validation (20 pages / 802 references / 142 images), complete automated suite and regenerated CMS-artifact static validation (806 references). The Studio preview build was rerun because it imports the shared stylesheet. Targeted regression tests cover persistent manual pause, explicit resume, arrow use while paused, all automatic-pause conditions, motion-preference changes, same-tab reload persistence, and storage exceptions. Existing event/CMS/refresh/navigation tests remain passing.

Installed Chrome headless tested all 20 Spanish/English main/ministry routes at 390, 768 and 1440 CSS pixels (60 combinations), measuring root/body scrollWidth against viewport clientWidth: no horizontal overflow or broken images. The actual control measured 48px with a 16px icon and remained inside the hero navigation at each width. Full-page and control-detail screenshots were saved and representative mobile date/control images inspected.

Trusted browser Enter and Space input, visible focus and touch-emulated pause/resume passed. Pause persisted through two autoplay intervals after blur/arrow use/preference changes; a language navigation/reload retained it. Only explicit resume re-enabled autoplay. Real-browser focus, hover and reduced-motion pause/resume checks passed; hidden-tab precedence is covered by the automated regression model rather than a new physical background-tab test. Chrome accessibility-tree verification exposed the named Resume slideshow button. There were no browser runtime/network errors in the completed targeted suite.

The date-layout fixtures existed ONLY in local browser DOM, using the real shared renderer and stylesheet; no file catalog or Sanity test record was created. Root pages remain in file mode. The regenerated ignored CMS artifact contains the same corrections and the existing published-only u2olnd8u/poc configuration; no CMS activation occurred.

### Exact changed files since prior verification

```text
assets/app.js
assets/style.css
scripts/build.mjs
scripts/check.mjs
scripts/test-ui.mjs
es/index.html
en/index.html
SANITY_RELEASE_READINESS.md
```

The two homepages were regenerated from the source generator. The complete release allowlist still contains the same 51 paths, with the existing 16/29/6 proposed commit groups; no new source paths or dependencies were added. Final correction hashes and verification evidence are recorded outside the worktree in hero-corrected-manifest.json and hero-correction-browser.json. Final preservation, credential/empty-feed and whitespace checks are recorded with that evidence.

### Remaining limitations

No known Critical or Major defect remains from these targeted findings. Actual Safari/WebKit, physical iOS/Android touch and screen-reader speech/announcement testing (NVDA/VoiceOver/TalkBack) still need manual acceptance. Browser accessibility-tree and trusted input checks do not replace that testing or a complete accessibility audit. Storage-blocked browsers retain pause only until navigation/reload, as described above. The existing 13 moderate CLI/build dependency advisories remain under preparation-only acceptance; no dependency remediation or production-risk acceptance is implied. No release action is authorized by this correction.


## Authorized church pilot activation - 2026-11-19

Production activation is now reproducible: content/event-source.mjs selects Sanity for normal builds, reusing the existing anonymous published-only bootstrap. Exactly four Home/Eventos outputs are activated; the file catalog remains empty. Target remains u2olnd8u/poc. Shared preparation supports already-active and file-mode pages without duplicate feeds. New regressions verify default rebuild activation, explicit file-mode rollback, safe re-preparation and duplicate rejection. Design and artwork are unchanged. PRODUCTION_RELEASE.md documents the durable corrective-commit rollback; GUIA_ADMIN_EVENTOS.md provides Spanish nontechnical pilot instructions. Earlier file-only preparation notes are historical. Exact activation/merge/Pages references and live smoke-test evidence are recorded in the final release report after publication. No billing, membership or dataset changes are required.
