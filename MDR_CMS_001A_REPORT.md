# MDR-CMS-001A — legacy slug compatibility correction

Date: November 25, 2026. Implementation: d33b99ed276d6b041cd235a477d3f886caa54ee4.
Branch: fix/mdr-cms-usability-expiration. Existing draft PR: https://github.com/ericpatricio/mdr-church-website/pull/7.
Parent reviewed RC: 843990364ac687c3018c863a30744d4925a0bcfe.
The final candidate includes the subsequent documentation commit. Its exact head SHA and final GitHub CI URL/result are recorded in PR #7's description and the delivery report; the old SHA is not the current release candidate.

## Root cause and smallest correction

Sanity 6.24.0 adds native slug structure and uniqueness validation even when the field is hidden/read-only and no custom validation is supplied. A duplicated legacy value could produce slug.not-unique on a field the volunteer cannot edit.

The deprecated event.slug field now has the supported field-local option:

    options: {isUnique: () => true}

Stored slugs remain hidden/read-only and are not modified. Native document ID remains the sole authoritative event identity. Only the unused legacy uniqueness constraint is removed; there is no global validator change, custom publish action, manual identifier generator or data migration. Native slug structure validation, native ID checks, all required content/end/flyer rules and other document types' uniqueness remain enabled.

Sanity documents this exact option: https://www.sanity.io/docs/studio/slug-type#isUnique
No runtime dependency version, website rendering, location configuration, role, endpoint, public perspective or hosting setting changed.

## Before/after native-validator evidence

studio/scripts/test-native-validation.mjs imports the real event.ts schema, compiles it with installed Sanity 6.24 built-in types, and calls the installed native validator. The test-only compiler uses the pinned package's built-in type export; it is not an application workaround. Package upgrades must reverify this fixture adapter.

Fixtures and uniqueness/reference responses exist only in memory. No auth token or network is required; unexpected requests and data mutation methods throw. Custom flyer validation and native asset-accept/reference validation are exercised, not skipped.

| Case | Native result |
|---|---|
| Actual event schema with only the new uniqueness option removed; copied slug already exists in the fixture dataset | Complete; expected slug.not-unique error |
| Corrected schema, same duplicate fixture | Complete; zero errors; no legacy uniqueness query |
| New event without slug, using schema initial values | Complete; zero errors |
| Existing valid legacy event | Complete; zero errors; slug unchanged |
| Existing draft without slug | Complete; zero errors |
| Two distinct IDs sharing title/legacy slug | Both complete; zero errors; distinct public IDs |
| Native-duplication-shaped draft with custom location/copied slug | Complete; zero errors; location and slug preserved |
| Published/draft variants of the same document | Both complete; zero errors; canonical identity unchanged |
| Title edit | Complete; zero errors; ID and old slug unchanged |
| Invalid native identity | Expected document-level rejection |
| Invalid title, end, flyer or external venue | Expected unrelated validation rejection |
| Another document type using a normal slug | Expected slug.not-unique; global uniqueness remains active |
| Malformed legacy slug object | Expected native structure rejection; no global skip |
| Other hidden fields and valid alternative-location backup | Valid data preserved; missing legacy technical values remain repairable |

Empty native IDs are tested against the actual unchanged document-level rule without asset traversal: Sanity's reference resolver itself requires a nonempty ID. Nonempty invalid IDs are also tested with the full event schema. This isolates the intended failure without suppressing unrelated validation.

The first native regression intentionally reproduces the old failure; it passes only if that error occurs. Negative content tests similarly pass only when rejection is retained.

## Focused verification

Completed local checks:
- Website build: PASS; 20 generated bilingual pages, no substantive generated-page changes.
- Static check: PASS; 806 references, 142 images.
- Existing website regression groups, including navigation, hero, categories, cancellation, bilingual content, expiry, outage and rollback: PASS.
- Existing deterministic correction tests: 28 passed, 0 failed.
- Existing Studio schema/component tests: 8 passed, 0 failed.
- New real-native-validator regressions: 14 passed, 0 failed.
- Total counted regression cases: 50 passed, 0 failed; existing legacy script groups also passed.
- Studio dependency-compatibility checks, type-check and production build: PASS.
- git diff --check: PASS.
- Credential scan before documentation: 426 source/build texts; no current-session token/private-credential findings.
- Dependency audit: 13 moderate known CLI/build findings, 0 high, 0 critical. No force fix, version change, new dependency or new override.
- Read-only official CLI documents validation of live poc under the corrected schema: exit 0, no error markers.
- Original development workspace: all 100 recorded source hashes and original status unchanged; main remains f450e2409d46ab7899a8be4d1ad9b3f29313bd6f.

All suites, including the new native tests, run in the existing read-only PR workflow. Technical readiness requires success on the final new candidate SHA; the final CI result is reported in PR #7 and the delivery message. No production deployment is implied by CI.

## Preservation and hidden-field review

The existing media-team draft retains the same ID/revision as the original read-only inventory and validates with zero native errors. Its custom location and all content remain unchanged. Published events remain zero; the file catalog stays empty. No production event/image was created, duplicated, patched, published or deleted.

Other fields were reviewed:
- timeZone is hidden only when already correct; a missing/invalid legacy value remains visible.
- venue/location are represented by the actionable church/external selector. Legacy missing values are visible in external mode; valid saved alternative data passes native validation.
- externalLocationBackup has no uniqueness/required rule; valid stored strings pass.
- sourceUrl/details/contact remain editable in the optional section, with their existing validation.
- malformed slug structure would still block validation and require technical repair. No such affected current record was found; the current draft validates. This is documented as a nonblocking hypothetical malformed-data condition rather than weakening structural validation or rewriting data.

No further confirmed code release blocker was identified. Authenticated user acceptance remains outstanding and must not be conflated with native validation eligibility.

## Safest practical authenticated acceptance environment

Live target remains project u2olnd8u / dataset poc.

Read-only aggregate inventory:
- poc: one existing event draft; four images. Never use it for test writes without separate explicit permission.
- production: no events or images; eleven system records only (ten system.group and one system.retention). No content values were read. The name alone is not proof that it is disposable or unused.

Sanity Free documents two public datasets: https://www.sanity.io/pricing . Both existing slots are occupied. A third dataset/upgrade is not proposed or authorized.

The smallest potential solution is to use the existing production dataset ONLY IF the founder confirms it is unused and explicitly authorizes isolated acceptance records. Approval has been requested; no acceptance writes have begun. Preserve every existing system record. No new project/dataset, role or billing change is necessary for that option.

After approval:
1. Prepare a disposable local-only Studio/website copy of the corrected candidate. Override both test configurations to dataset production; leave tracked/live configuration at poc.
2. Confirm both test targets before enabling input; restrict all writes to uniquely identified fictional records in the approved test dataset.
3. Use existing approved localhost origins for desktop acceptance. Any new LAN/phone CORS origins require exact-origin approval first; do not enable wildcard credentialed origins.
4. The representative signs in with their own invited account. Authentication/MFA/Google interaction requires that person; CLI validation does not certify this UI path.
5. Create without slug/name/address/zone entry; complete bilingual content/end/flyer; save/reopen; preview/publish; verify four test pages and categories; duplicate a legacy-slug fixture; edit/replace/extend/cancel; cross the expiration boundary; check suspension/offline recovery.
6. Repeat on Android Chrome and iPhone Safari with TalkBack/VoiceOver, date picker, software keyboard, focus/error navigation and upload/replacement checks.
7. Clean only explicitly recorded test documents and any test images created for that exercise, with scoped approval; never alter system records or live poc.

If production is not confirmed unused/authorized, defer authenticated testing and request a separately approved alternative. Do not repurpose it, create a dataset, change permissions or incur cost silently.

Existing practical checklist: ACEPTACION_EVENTOS_ES.md. No physical-device or authenticated publication pass is claimed.

## Incremental files

- studio/schema/event.ts — supported override only on deprecated event.slug.
- studio/scripts/test-native-validation.mjs — actual-schema native before/after regression suite.
- studio/package.json — add native suite to existing Studio test command/CI.
- MDR_CMS_001_REPORT.md — historical report notice pointing to this correction.
- MDR_CMS_001A_REPORT.md — findings, evidence, acceptance environment and release gate.
- PRODUCTION_RELEASE.md — correction and approval/deployment-order note.

## Release recommendation and rollback

CONDITIONAL GO for the corrected technical candidate only after final GitHub CI success. Production authorization and final human acceptance remain separate. The prior confirmed uniqueness blocker is corrected; no other confirmed current-data/code blocker remains.

Required authorized release order:
1. Merge/release the compatible website only after explicit approval.
2. Verify successful main-only Pages deployment and actual live modules/four pages.
3. Deploy the matching Studio to its existing app/project/poc dataset only after approval.
4. Conduct only explicitly authorized live acceptance; never invent permission for production test events.

Keep the compatibility adapter if new-schema records exist. Do not blindly revert to the old strict slug/details behavior or old hidden uniqueness bug. Urgent public fallback uses a new corrective commit selecting the empty file catalog and regenerating the four pages, with build/check/tests and separate merge/deployment approval. No reset/force-push, dataset deletion or destructive migration.

Nothing is merged or deployed by this correction. Final head/CI references are in PR #7 and the delivery evidence.
