# MDR-CMS-002 — 12-hour time format

Date: November 26, 2026. Base: d7d4bc634edd15f70d35acd464f3e4ee1afa3d57.
Branch: fix/mdr-cms-002-12-hour-time. Status: corrective PR; NOT deployed.

## Targeted implementation

Both event datetime fields use Sanity's supported options.timeFormat: 'h:mm A'.
displayTimeZone: America/New_York and allowTimeZoneSwitch: false remain unchanged.
No validation, initial date, storage, document identity, location, publication or expiration behavior changed.
Sanity still serializes Date values through toISOString(); there is no data migration or content rewrite.

Studio EventPreview already calls the public renderEventCard function.
English public cards already used 12-hour time, but Spanish defaulted to 24-hour time.
The shared renderer now explicitly sets Intl hourCycle: 'h12'. This keeps localized Spanish a. m./p. m. and English AM/PM, with 12:00 rather than 00:00 at midnight.
Using the same renderer keeps preview and public lists consistent with the native input.
Generated pages remain unchanged because the file catalog is empty; one public renderer asset changes.

## Installed native behavior

Installed Sanity: 6.24.0. No dependency update or custom date/time picker.
Official option: https://www.sanity.io/docs/studio/datetime-type (timeFormat).
The installed DateTimeInput reads timeFormat for formatting/parsing the editable text and retains fixed-zone parsing and UTC serialization.
The actual current event-input calendar (utils-BTC8Ifas.js, not a different legacy calendar chunk) uses a native HTML input type=time, labelled Seleccionar hora.
That control's stored input value remains HH:mm by HTML design. Its user-visible AM/PM presentation depends on browser/OS regional settings; schema timeFormat does not force a particular operating-system picker presentation.
No CSS, lang override, native package modification, dependency override or custom picker was added to production.

## Browser evidence

A local, offline component harness rendered the actual exported Sanity DateTimeInput and actual event schema, with installed UI/i18n components.
Only remote user-preference persistence was replaced in memory with an unset preference; real date/time parsing, timezone conversion, native input and calendar were retained.
All documents and changes stayed in React memory. No project token or CMS request was used to create/edit records.
The browser's simulated timezone was America/Los_Angeles to verify that fields still use New York.
Actual native editable fields displayed both start/end correctly for:
midnight, noon, morning, evening, after midnight, spring-DST before/after, and both stored instants in the fall repeated hour.
Rendering those dates emitted zero patches and left UTC timestamps unchanged.
Trusted keyboard input of 9:30 AM produced the correct New York UTC timestamp.
Calendar start/end tested at 390px, 768px and 1440px:
visible 12:00 AM / 12:00 PM controls, accessible native AM/PM spinbutton in Chrome's accessibility tree, control fits viewport.
Calendar opening through emulated touch at 390px passed.
Keyboard selection on the native PM segment changed noon to midnight and produced the correct UTC value.
No JavaScript errors in the final browser run.
Representative 390px screenshot visually inspected.
Local evidence: studio/.sanity/cms-002/native-time-results.json and native-{start,end}-{390,768,1440}.png.
These are component/browser emulation results, not authenticated full-Studio or physical-phone acceptance.
The initial harness needed a missing UI LayerProvider; that was fixed in ignored test support only. No application workaround resulted.

## Regression results

- Website build PASS: 20 pages.
- Static check PASS: 806 local references, 142 images.
- Existing website/UI/CMS suites PASS, including exact expiration, overnight and DST regressions.
- Website corrective cases: 32 PASS (28 existing + 4 new bilingual display/storage cases).
- Studio type-check and build PASS.
- Existing Studio semantic/dependency tests, 8 schema/component cases and 14 native-validation cases PASS.
- New Studio tests: 11 PASS using the installed native formatter/parser and actual schema options.
- Explicit cases: 12:00 AM midnight, 12:00 PM noon, 9:30 AM, 7:45 PM, after-midnight date rollover, spring DST gap crossing, summer time, fall repeated-hour stored values.
- Validation rules and expiration implementation unchanged. Existing UTC instants, datetime attributes and data-expires deadlines remain unchanged.
- Read-only preservation PASS: original church draft, four images and system permission records match release hashes; isolated production remains 11 original records.
- One published live event was added before this branch existed (last updated 17:19:49Z; branch created 17:22:18Z). It remains untouched; live inventory is now 18, not the old release snapshot of 17. No assumption of an empty live feed or test-record cleanup was made.
- Hosted Studio deployment and CORS unchanged. Credential scan: 87 proposed/source text files, zero credentials detected. No CMS write operation is part of this change.
- No resolved dependency changes. The previously accepted 13 moderate tooling advisories remain outside this formatting change.

## Remaining acceptance and limits

Physical Android Chrome and iPhone Safari time pickers and real TalkBack/VoiceOver are NOT tested.
Native control AM/PM was verified on installed Windows Chrome using device-width/touch emulation. Other device regional preferences may expose a 24-hour OS picker; this cannot be promised away by timeFormat.
If forced AM/PM on every OS picker is required, stop for separate approval before investigating an alternative; do not silently replace the native control.
The fall repeated local hour remains inherently ambiguous when manually retyped without an offset; both original stored instants remain intact when displayed. This correction does not change the existing native parsing policy.
No production fixture or authenticated production edit/publication was performed.

## Deployment gate and scope

Only Studio redeployment would change editable inputs, but would leave Spanish public cards at 24-hour time.
Because bilingual preview/public consistency is requested, this PR also contains the single shared renderer option; it requires the normal website asset release in addition to Studio redeployment.
No website redesign, generated HTML change, production configuration change, data migration, paid service or new dependency.
After explicit authorization only: merge approved PR through existing validation/main-only Pages process, verify website formatter asset, then deploy matching Studio to the unchanged mdr-eventos / u2olnd8u / poc target.
No merge or deployment is authorized by this PR preparation.
Rollback is a reviewed formatting-only corrective revert; no document/image cleanup or date conversion is needed.
