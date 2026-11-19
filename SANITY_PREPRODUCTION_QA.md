# MDR Sanity POC — targeted preproduction corrections

Date: November 18, 2026. Branch: development/sanity-events-poc.

Production adoption remains blocked pending manual acceptance. The two reported
implementation defects have local corrections and passing automated regression
coverage. No Critical issue was observed in completed checks. This is not a claim
that unperformed browser or assistive-technology checks passed.

No commit, push, merge or deployment was performed. Production configuration,
branding, church information and file-based event publishing were not changed.
Existing uncommitted work was preserved. The only remote mutation was deletion of
the specifically authorized, identified fictional POC draft described below.

## Corrections

### Event refresh

`assets/event-refresh.mjs` reconciles cards by event identifier and compares their
rendered content. Identical cards keep their actual DOM nodes: no innerHTML write,
replacement, or unnecessary move. Their keyboard focus and expanded details remain.
Editing another card leaves them untouched. Changed cards are replaced individually
and retain their disclosure state. Reordering reuses nodes and restores focus if a
focused node must move. A changed or removed card's control may lose focus; focus
preservation is guaranteed here for unchanged retained cards, not deleted controls.

Cancellation updates the Eventos card and removes it from homepage eligibility.
Deletion and expiration remove affected cards. Time filtering uses the existing
shared event model and New York date rendering. Existing category filtering and
homepage limit/promotion still run through mdr-events-updated. Unavailable data
clears cards; short outages retain the existing bounded stale-data policy.
The ten-second UI tick and sixty-second successful-fetch interval are unchanged.

Regression tests in scripts/test-cms.mjs exercise Spanish and English rendering,
zero card DOM mutations for identical fresh record objects, node identity, focus,
expanded details, content edits, cancellation, deletion and expiration. These use
a minimal DOM model, not a real browser; the existing expiry/DST/filter tests also
pass. No new dependencies were added.

### Studio radio group

`studio/components/ConditionField.tsx` uses a native fieldset/legend for
Estado del encuentro instead of the broken single-input label. It retains
Sanity's original radio children, individual option labels, keyboard behavior and
focus styling. Group description/errors are associated by aria-describedby;
invalid groups expose aria-invalid and a persistent atomic alert region announces
validation changes. Actual announcement output remains a manual acceptance item.

The schema registers this component through Sanity's field customization API.
The static-rendering test checks the real field component's group, legend,
description/error IDs, invalid state, alert region and preservation of children.
It does not prove native radio keyboard/focus behavior or screen-reader output.

### Studio simplification

Sanity configuration now sets releases.enabled=false and
document.comments.enabled=false. These configuration entries are present in the
installed Sanity 6.24.0 types and accepted by type-check/build. No CSS hiding or
DOM workarounds were introduced. Their actual absence from the running UI still
requires browser verification.

### Exact test-data cleanup

Before deletion, authenticated raw reads of dataset poc confirmed:

- Draft ID: drafts.f5084bdc-84c9-4f8b-920d-b0e3c8f65913.
- Spanish title: Evento ficticio — versión editada.
- English title: Fictional event — edited version.
- Condition: cancelled; start: 2026-12-12T20:00:00.000Z.
- Published ID f5084bdc-84c9-4f8b-920d-b0e3c8f65913 was absent.

A guarded CLI script asserted project u2olnd8u, dataset poc, type, both titles,
condition and start before deleting that existing draft ID. Both variant IDs
were confirmed absent afterward. Raw event count is zero. Every other document
and asset ID/revision matched before and after. No assets were deleted and no
history was purged. Anonymous published results and the file-based catalog are
both empty. The cleanup script is ignored scratch under studio/.sanity.

## Verification results

| Check | Result |
| --- | --- |
| npm.cmd run build | Passed: 20 bilingual pages |
| npm.cmd run check | Passed: 802 local references, 142 images; metadata, subpaths and content checks |
| npm.cmd test | Passed: all website suites, including new refresh regressions and existing filters/navigation, bilingual events, DST, draft isolation, outages and local-only integration |
| npm.cmd test --prefix studio | Passed: semantic field static-rendering regression |
| npm.cmd run typecheck --prefix studio | Passed |
| npm.cmd run build --prefix studio | Passed locally; initial sandbox run failed uv_os_get_passwd ENOMEM, authorized outside-sandbox rerun succeeded |
| node --check on CMS UI and refresh modules | Passed |
| git diff --check | Passed; Git reports existing LF/CRLF conversion warnings, not whitespace errors |
| Authenticated raw POC event count | Zero after exact cleanup |
| Anonymous published feed / file catalog | Both empty |

## Browser evidence and limitations

This correction pass attempted browser testing. Browser inventory reported
"The browser access host is unavailable". Native Chrome inventory and its
accessibility tree could be read, but selecting the existing local Studio tab
failed with "coordinate input geometry is unavailable". Consequently no corrected
UI interaction, populated viewport matrix or new visual pass is claimed.

The preceding QA pass inspected empty local Spanish/English Home and Eventos and
Studio at 390, 768 and 1440px. It found no document overflow in those samples;
mobile menu opening/Escape/focus return, language links and empty category status
were checked. Those are historical results, not verification of this patch.
Earlier administrator publication/upload/replacement/cancellation exercises were
accepted, but also do not replace the outstanding correction-pass checks.

## Outstanding issues / acceptance gaps

### Critical

None observed in executed checks. Production approval remains withheld.

### Major — unverified acceptance requirements

1. Repeat populated Spanish and English Home/Eventos at 390, 768 and 1440px:
   flyer loading, no overlap/overflow, category filters and mobile navigation.
2. In a real browser, focus a card summary/link and expand details; wait through
   multiple ten-second ticks and a successful sixty-second fetch. Confirm focus,
   node retention and disclosure state; then test changed content, cancellation,
   deletion, expiry, reordered cards and homepage promotion.
3. In Studio, verify the actual radio group's accessible name, individual labels,
   arrow-key selection, Tab order and visible focus. Trigger a validation error
   and verify association and announcement using NVDA, Narrator or VoiceOver.
4. On a physical phone, verify flyer selection/upload/replacement and
   publish/cancel actions. Responsive emulation cannot certify these workflows.
5. Visually and with a screen reader verify loading, empty, unavailable and stale
   status transitions, including five-minute stale-data removal and recovery.

These are verification gaps, not newly observed product failures. The automated
DOM model and static React rendering cannot certify browser focus behavior or
screen-reader announcements.

### Minor — unverified presentation

Confirm Releases navigation and comment controls are absent in the running Studio
after the configuration reload. No remaining test-record cleanup issue exists;
intentionally retained image assets are outside the authorized cleanup scope.

## Files changed in this correction pass

- assets/event-refresh.mjs (new): incremental card reconciliation.
- assets/cms-poc-ui.mjs: use reconciler instead of replacing list innerHTML.
- scripts/test-cms.mjs: refresh interaction regressions.
- studio/components/ConditionField.tsx (new): semantic radio group wrapper.
- studio/schema/event.ts: register the field component.
- studio/sanity.config.ts: disable Releases and comments.
- studio/scripts/test-condition.mjs (new), studio/package.json: semantic field test.
- SANITY_PREPRODUCTION_QA.md: this updated evidence and acceptance record.

Local Studio build output and ignored QA scratch were generated. Other existing
branch changes predate this correction pass and were preserved. Production is
still file-based; Sanity adoption needs explicit approval after acceptance gaps
are closed. Nothing has been committed or deployed.
