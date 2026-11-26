> MDR-CMS-001A: the hidden legacy-slug uniqueness blocker identified at 8439903 is corrected by d33b99ed276d6b041cd235a477d3f886caa54ee4. See MDR_CMS_001A_REPORT.md for actual native-validator evidence, updated test counts and remaining approval gates. This earlier report is historical; no production deployment is authorized.

# MDR-CMS-001 — corrective release candidate

Date: November 25, 2026. Status: **CONDITIONAL PASS — local candidate; production approval required**.

## Executive result and baseline

Clean isolated clone: C:/Users/ericw/Desktop/Projects/MDR/MDR-website/mdr-cms-corrective.
Branch: fix/mdr-cms-usability-expiration. Base: f450e2409d46ab7899a8be4d1ad9b3f29313bd6f, the merged PR #6 production release. Remote main has no later changes at initial inspection. Main-only Pages hosting and the read-only pull_request validation workflow are preserved. No production settings, permissions, URLs, datasets or services are changed.

The original development workspace remains uncommitted and untouched. The relocated release worktree has stale Git metadata referring to its former Desktop path; it was not repaired or reset. A separate clone avoids risking either workspace.

Read-only authenticated inventory of u2olnd8u/poc: **one existing draft, zero published event documents**; the draft has no slug, has an end, and has a custom venue/address. Its title, identifiers, venue details and content are deliberately excluded from this report. No document or image was created, patched, migrated or deleted. Existing deployed schema metadata confirms workspace mdr-events-poc, project u2olnd8u, dataset poc; authenticated representative UI is not impersonated. The live production address was read from the Visit page and matches project content: **4360 Monterey Rd, Kissimmee, FL 34758**. The official accented church name is retained.

Before changes, website build/check/all seven existing regression groups and Studio typecheck/two existing test groups passed.

## Identifier incident and decision

Confirmed cause: the required slug used title.es only as the manual Generate source. No automatic input/action supplied it. Chained required/custom slug validation and nested slug state could report multiple technical errors for the same missing value. The existing real draft reproduces the missing-slug state; source inspection and schema tests verify the required manual dependency.

No event-specific URL, anchor, external link or preview route uses the slug. Only the CMS normalizer used it as a reconciliation key. The candidate instead derives a lowercase internal key losslessly from Sanity's immutable native document ID. IDs are unique independently of title, accents, ñ, punctuation, emoji, blank titles or copied slugs. Native creation/duplication owns allocation; there is no effect writing slug values, asynchronous uniqueness lookup, title-change race or publish interception. Invalid/missing document identity produces one Spanish document-level error and blocks publication; blank titles still fail content validation.

Legacy slugs remain stored, hidden and read-only. No migration or identifier overwrite occurs. Internal reconciliation keys change once when the new website loads; there are no public event URL changes. Draft IDs are validated using their canonical base identity; the anonymous feed continues rejecting draft/version IDs. Existing same-title documents and duplicates with copied slugs now remain distinct.

This deliberately uses the expressly permitted document-ID alternative rather than generating title-based slugs. Titles and optional fields must never determine stable identity.

## Complete field audit and before/after

All bilingual objects retain their existing field paths; no stored fields are deleted.

| Internal field | Previous visible label | Purpose / public consumer | Before → after / required status | Dependencies and data protection |
|---|---|---|---|---|
| title.es / title.en | Título / Español / Inglés | Card heading, Studio list and preview | Primary bilingual titles, required | Title edits never rekey a document |
| slug.current | Identificador | Previously normalizer/card key only | Manual required → hidden, read-only legacy | Public key now derives from _id; old value retained |
| description.es / en | Descripción | Public card summary and preview | Primary, required | No text copied, consolidated or removed |
| details.es / en | Detalles | Expanded public details and preview | Required → optional under additional information | Existing text preserved; new text must fill both languages; no empty disclosure |
| start | Inicio | Ordering, display, active eligibility | Required, local NY picker | Stored UTC timestamps; native DST-aware picker retained |
| end | Fin (opcional) | Expiration and date range | Finalización, required on publication | Strictly after start; no old data backfill |
| timeZone | Zona horaria | CMS validation and renderer | Automatic NY; hidden when valid | Existing unexpected/missing value remains visible for correction rather than silently rewritten |
| category | Categoría | Public category filters | Default Comunidad, optional section | Still validated; worship option preserved, existing value retained |
| locationChoice (new) | — | Spanish selector; public uses existing strings | Default En nuestra iglesia / Otra ubicación | Only explicit selection changes fields; legacy mode inferred without writes |
| venue | Nombre del lugar | Card/preview venue | Automatic church summary, or required external input | Existing custom values remain untouched on opening/duplication |
| location | Dirección | Card/preview address | Automatic church summary, or required external input | Exact authoritative address, shared configuration |
| externalLocationBackup (new) | — | Restore external place after switching back | Hidden saved alternative | Only explicit selection snapshots/restores strings; no asset or content deletion |
| flyer | Volante | Public image and preview | Required native upload; 5 MB JPG/PNG/WebP | Validation errors and failed verification block publish; file URLs public even in drafts |
| imageAlt.es / en | Descripción accesible del volante | Bilingual alt text | Required with concise instructions | Meaningful accessibility retained |
| condition | Estado del encuentro | Cancellation, list badges, homepage exclusion | Native Programado/Cancelado in publication section | Accessible fieldset retained; expired is derived, never stored as condition |
| registrationUrl | Enlace de inscripción (opcional) | Public register link, suppressed on cancel | Optional collapsed section | HTTPS validation retained |
| sourceUrl | Fuente oficial (opcional) | Provenance, not rendered on cards | Optional collapsed section | Kept editable to correct any old invalid value; no forced repeated entry |
| contact.es / en | Contacto verificado (opcional) | Expanded details | Optional collapsed section | Both languages or neither; existing public contact retained |

Ordered native fieldsets: Información del evento; Fecha y horario; Lugar del evento; Volante; collapsed Información adicional; Vista previa y publicación. Native Sanity field validation links, upload, save/draft/publish confirmation and Spanish localization are retained.

Description and details are not merged: they have distinct summary/disclosure presentation and historical content. Details become optional instead of requiring repeated prose. Unused sourceUrl is retained as optional provenance rather than deleted.

## Default location / 5A

content/church.mjs is the single authoritative church name/address/time-zone source. content/site.mjs re-exports it, preserving all existing consumers. The public configuration and rendered church information are unchanged.

Native new-document initial values populate locationChoice=church, venue, location and America/New_York. The supported document input supplies a scoped form-patch context to the custom selector. One explicit change emits one PatchEvent with only the related root fields, preserving other form changes and Sanity's draft pipeline. No mount effect writes data. Existing location mode is inferred from current strings only when no mode exists. Duplication retains intended location and its backup; the native duplicate action is available again.

At church, the information is shown as a concise read-only summary and the two editable strings are hidden. External mode requires both strings. Switching to church preserves the alternative and assigns authoritative values atomically; switching back restores them. Opening an existing external event does not change any value. Location selection never participates in expiration calculations.

Supported APIs: Sanity initial values and form patches, native UI radios, fieldsets and conditional fields. No CSS hiding hacks, DOM rewriting or custom authentication.

## Expiration: existing behavior and correction

Existing eligibility already used numeric timestamp comparisons, sorted events, included active events until end, excluded cancelled home cards and used end-or-start for legacy records. Deficiencies: end was optional; expiry could lag the 10-second CMS/30-second general UI checks; the CMS refresh awaited network before reconciling; online/focus/page-resume were not all rechecked.

The candidate adds a single local timer for the nearest future end (legacy fallback start), with >= boundary expiry via the existing strict-future filter. It renders without network and re-arms after load/edit/extension/removal. Browser timeout range is bounded; expired deadlines cannot create a busy loop. Existing network refresh cadence is unchanged. Visibility, page-show, focus and online resumption reconcile current time before a forced network refresh. Home promotion/category status continues through the existing update event.

No expiry writes, deletes, unpublishes, scheduled rebuilds, paid automation or high-frequency API polling. End is required on future Studio publication, including republishing an older record. An already-published old record without end remains unchanged and disappears at start, matching prior policy; no invented time. History views use coalesce(end,start), native draft badges and dates: all events/drafts, upcoming, in progress, ended and cancelled. These are navigational queries, not stored lifecycle mutations. Reopen a history view if it was open across a boundary.

Limitations: JavaScript cannot execute in a suspended browser; eligibility catches up on resume. An incorrect device clock affects local expiry. Offline clients cannot learn a new extension/cancellation until network recovery; five-minute stale-data removal remains. The fixed NY zone applies to external locations too, as requested. Actual native picker behavior at ambiguous DST hours needs phone acceptance.

## Verification and evidence

- Website build and static check: PASS, 20 pages, 806 references, 142 images.
- Existing website regressions: seven printed PASS groups; existing Studio regressions: two PASS groups.
- New deterministic website/location/identity/expiration tests: **28 passed, 0 failed**.
- New actual Studio schema/component tests: **8 passed, 0 failed**.
- Studio typecheck and production build: PASS.
- Real Chrome headless: **16 populated bilingual route/viewport combinations** (Home/Eventos, ES/EN, 360/390/768/1440); no measured horizontal overflow or image decode failures. Filters and three-home-card limit passed. Identity/focus/open disclosure preserved on an unchanged refresh. A short active event expired through its local deadline while a network request stayed pending.
- Actual custom location component in a labelled isolated fixture: four viewport checks, keyboard radio selection, visible focus, Chrome accessibility-tree names, touch-emulated church/external switching and preserved alternative place passed.
- Fixture context mocks Sanity form state; it is not an authenticated end-to-end Studio publishing test. No real content or test data was written to the dataset.
- An initial fixture touch failure came from screenshot capture disturbing scroll position. Explicitly scrolling the labelled touch target before injection fixed the harness; the complete final browser suite passed.
- Browser evidence/screenshots: studio/.sanity/qa/corrective-final-browser.json, corrective-*.png, location-component-*.png (ignored local artifacts, not public release content).
- Security: zero high/critical, 13 moderate known local-tooling advisories; no forced upgrades. @sanity/ui is now explicitly pinned to its already-resolved 4.4.12 version because production source imports its supported components. The lockfile adds only the root declaration; no resolved package version changed.
- Final credential/data/whitespace verification and exact committed file list are recorded in the final delivery addendum.

Physical Android Chrome, iPhone Safari, actual screen-reader announcements/error navigation, native phone date pickers, authenticated upload/replacement, draft persistence and publish/cancel actions require the Spanish acceptance checklist. Do not call those passed based on the component fixture.

## Compatibility, migration and deployment approval gate

**No production data migration is required or authorized.** Inventory remains read-only. Existing draft and custom location stay unchanged; no backup containing private content is committed.

Production sequence, only after founder approval:
1. Reconfirm current main and inventory; preserve a secure dataset export before any separately approved future data migration (none proposed here).
2. Merge/release the website compatibility adapter first and wait for main-only Pages success. Verify existing published documents, anonymous published-only reads and empty/error states.
3. Only then deploy the matching Studio to its existing hostname/project/dataset using the official CLI. New Studio allows absent slug and optional details, which the old website rejects; **Studio-first release is unsafe**.
4. Confirm representative acceptance on physical devices and the approved Spanish checklist in a controlled test environment. Publishing any production smoke event requires separate permission.
5. Keep all real documents/assets and account permissions untouched. Individual future events update automatically without GitHub involvement.

Rollback:
- Before Studio update/new documents, the website-only change can be reverted through a new corrective commit after reviewing overlap.
- After new-schema documents exist, do not restore the old strict slug/details adapter blindly: it could invalidate the whole feed. Keep the compatibility adapter and revert only the faulty Studio/UI behavior where possible.
- For an urgent public failure, use the existing durable file-source rollback: change content/event-source.mjs to file, rebuild/check/test, commit the selector/four Home/Eventos outputs on a new branch and obtain release approval. Do not reset/force-push main or delete CMS documents/images.
- A prior Studio schema would again require slugs on new records; assess any rollback against current records and warn administrators before changing authoring behavior. Hidden/new fields remain stored; no destructive reverse migration.

Founder decisions: approve native document-ID alternative and simplified workflow for release; complete/accept the physical-device checklist; accept the documented moderate-tooling residual risk; then explicitly authorize website-first and Studio-second production deployment. This candidate is not deployed, and no production migration or real event edit is authorized.

## Documentation and changes

GUIA_ADMIN_EVENTOS.md contains the candidate Spanish workflow and troubleshooting. ACEPTACION_EVENTOS_ES.md is the real-user checklist. EVENTS_GUIDE.md, CMS_POC_GUIDE.md, QA.md, SANITY_PREPRODUCTION_QA.md, SANITY_RELEASE_READINESS.md and PRODUCTION_RELEASE.md distinguish historical POC evidence from this candidate and its approval gate.

Source changes are limited to the shared church configuration, native identity/optional-details adapter, expiration clock and resume integration, Studio fieldsets/location input/validation/history, tests and these documents. Generated HTML/design/hero/ministry assets have no substantive changes. Commit SHA and draft PR are reported in the final delivery; nothing is merged or deployed.

## Final delivery addendum

Implementation commit: fce866a6624b9206021a2f27e122ed41a0f98a3a. Documentation is committed separately on the same corrective branch. Draft PR URL and final documentation SHA are returned in the delivery message; they are not authorization to merge.

Final integrity verification: 425 source/build text files scanned without credential findings; the one existing draft has the same ID/revision, raw/public counts remain 1/0, file catalog remains empty, all 100 original source hashes/status unchanged, main remains f450e2409d46ab7899a8be4d1ad9b3f29313bd6f, all resolved dependency records and generated HTML remain unchanged, diff --check passes. No temporary CORS origin was needed.

Remaining moderate audit nodes: @oclif/core, @oclif/plugin-help, @oclif/plugin-not-found, @sanity-labs/oclif-plugin-skills-flag, @sanity/blueprints, @sanity/cli, @sanity/cli-build, @sanity/cli-core, @sanity/runtime-cli, @sanity/workbench-cli, @sanity/workflow-cli, minimatch and sanity. These are the previously documented local tooling chain; audit suggests incompatible Sanity changes for the aggregate fix. No force fix or new override was applied. See the existing security analysis in SANITY_RELEASE_READINESS.md for exposure and acceptance context.

Exact candidate manifest (29 paths; no generated pages, artwork, caches, private inventory or local fixture):

- ACEPTACION_EVENTOS_ES.md
- CMS_POC_GUIDE.md
- EVENTS_GUIDE.md
- GUIA_ADMIN_EVENTOS.md
- MDR_CMS_001_REPORT.md
- PRODUCTION_RELEASE.md
- QA.md
- SANITY_PREPRODUCTION_QA.md
- SANITY_RELEASE_READINESS.md
- assets/cms-events.mjs
- assets/cms-ui.mjs
- assets/event-expiration.mjs
- assets/event-identity.mjs
- assets/event-model.mjs
- assets/event-refresh.mjs
- assets/event-rendering.mjs
- content/church.mjs
- content/site.mjs
- scripts/test-cms-corrections.mjs
- scripts/test.mjs
- studio/components/EventInput.tsx
- studio/components/EventPreview.tsx
- studio/lib/event-location.mjs
- studio/lib/event-validation.mjs
- studio/package-lock.json
- studio/package.json
- studio/sanity.config.ts
- studio/schema/event.ts
- studio/scripts/test-usability.mjs
