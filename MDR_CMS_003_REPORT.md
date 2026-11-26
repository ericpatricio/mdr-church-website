# MDR-CMS-003 — Event category visibility correction

Date: November 26, 2026.
Branch: fix/mdr-cms-003-category-visibility.
Base main: 2ea50d5667fd12afec585497cd69939c9fd582fa.
Status: draft corrective pull request; no merge or deployment.

## Targeted change

The existing internal field name category is retained.
Its native Sanity definition is moved to information, directly after the bilingual title and before description.
Title: Tipo de evento.
Native options.layout: radio, with two choices only:
- Cultos y servicios: worship
- Comunidad: community

Guidance: Selecciona el tipo de evento para que aparezca en la categoría correspondiente de la página web.
Missing/invalid selection error: Selecciona el tipo de evento: Cultos y servicios o Comunidad.
The information fieldset is not collapsed. The additional fieldset no longer contains category.
No All option, custom input component, dependency or migration was added.

newEventDefaults no longer assigns category. Other defaults (church place, New York time zone, scheduled state) remain unchanged.
The field has no per-field initialValue. Existing documents and duplicates keep their assigned value.
No mount effect, patch, stored-value reset or automatic reclassification was added.
Existing valid test fixtures now explicitly choose their category; they no longer depend on the removed default.

## Published Bible Study — read-only finding

The published Estudio Biblico / Bible study event currently has category community.
It therefore appears under Comunidad/Community and All/Todos, not Cultos/Services.
For the intended service grouping, worship (Cultos y servicios) is the appropriate classification.
The event was NOT edited, reclassified or republished. Any church-approved correction is a separate content action by an authorized representative.
The original media-team draft, other content and images are protected by before/after inventory hashes.

## Public compatibility and release recommendation

Existing public mapping is unchanged:
worship -> Cultos (ES) / Services (EN)
community -> Comunidad (ES) / Community (EN)
all -> Todos (ES) / All (EN), a public filter only.
The shorter existing Spanish public label Cultos remains understandable alongside the more explicit CMS label. No public copy/design change is necessary.

No public runtime asset, content configuration or generated page changes.
Studio-only deployment is sufficient after authorization. No GitHub Pages redeployment is technically required for this correction.
Repository hosting currently deploys main through its existing Pages process: a later normal PR merge may still invoke that existing automatic deployment even though public files are unchanged. Do not change hosting/workflow settings to suppress it under this task.
No website deployment was triggered by the corrective branch push or draft PR.
No merge/deploy is authorized by this preparation.

## Tests and browser evidence

Website build and static validation PASS: 20 bilingual pages, 806 references, 142 images.
Existing website/UI/CMS suites PASS; 38 counted website cases.
Studio type-check and build PASS.
Studio schema/component cases: 11 PASS.
Actual installed native validator cases: 16 PASS.
Existing installed time-format cases: 11 PASS.
Total: 76 counted cases, plus existing semantic/dependency and legacy regression groups.

New regressions cover:
- Real schema field order, noncollapsed information fieldset, native radios, exact two choices and messages.
- No initial category, rejection of undefined/null/blank/all/unsupported values.
- Missing category produces an actual native validation error on category, preventing normal validated publication.
- Existing and duplicated worship/community documents validate without category changes; opening the document or switching location emits no category patches.
- Unpublished category edits remain hidden in a controlled EventFeed; simulated publication updates the same record and card category.
- Both language filter labels/values and actual public filtering script; All includes both, and current filters update after a published category change.
- Homepage eligibility and exact expiration deadlines are independent of category.
- All earlier identifiers, locations, bilingual content, flyer, 12-hour format, DST/expiry, navigation and hero regression groups remain passing.

Installed native Sanity SelectInput radio layout was exercised locally at 390px, 768px and 1440px.
Both choices worked; trusted keyboard arrow transitions worked; emulated touch selection worked at 390px.
New documents had neither radio selected; existing values rendered selected without emitting patches.
Optional section remained closed; radios and guidance were visible; no measured horizontal overflow or JavaScript errors.
Representative 390px screenshot visually inspected.
This was an offline native-component harness using the actual schema and in-memory documents, not authenticated production publishing or a full Studio-shell acceptance claim.
No production records, datasets or test assets were created.
Physical Android/iPhone and assistive-technology checks remain unverified.

Local evidence (ignored): studio/.sanity/cms-003/native-category-results.json, category-required-*.png, category-selected-*.png, published-category.json, preservation-result.json.
Public update/publication scenarios use memory fixtures and native validation; no live event was republished for testing.

## Preservation and approval gate

Before/after read-only hashes verify all 18 live records, including published event, media draft, four images, identifiers and timestamps, unchanged.
Permissions, invitations, subscription features, CORS and hosted Studio deployment unchanged.
All runtime website files and production configuration unchanged; no new services, spending or dependency changes.
Spanish administrator guide updated for intentional selection and public filter mapping.
No rollback/migration is needed for existing data. If later reverting this UI change, use a reviewed corrective Studio source commit and preserve assigned categories.

Stop at release authorization. Do not merge, deploy, change the Bible Study category or modify production content without separate approval.
