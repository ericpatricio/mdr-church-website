> MDR-CMS-001 deployment warning: release the compatible website adapter before the updated Studio. New events may omit legacy slugs/details, which the old adapter rejects. Do not blindly roll the adapter back after new records exist. Follow MDR_CMS_001_REPORT.md for the approval gate and safe rollback.

# MDR pilot release and rollback

Public website: https://ericpatricio.github.io/mdr-church-website/
Studio: https://mdr-eventos.sanity.studio/
Project/dataset: u2olnd8u / poc. Public anonymous published-only reads; no write token in the site.

## Reproducible build

content/event-source.mjs selects the production source. EVENT_SOURCE='sanity' makes normal npm run build include exactly one CMS bootstrap on es/en index.html and eventos.html. Other pages and design stay unchanged. The file catalog remains empty, preventing duplicate event sources. Shared bootstrap generation is reused by prepare:cms, which supports both normal active pages and file-mode input. Pages deployment serves the committed root/es/en files from main; it does not publish the ignored release-preview directory.

npm run build:file is a local file-mode preview/rollback preparation command. It does not change the selector: a subsequent normal build follows the selector again. Do not treat that override alone as a durable production rollback.

Validation: npm run build; npm run check; npm test. The PR workflow runs those plus locked Studio installation/typecheck/tests without secrets or deployment authority. Current high/critical advisory check is required before release. The 13 documented moderate local tooling advisories are accepted for this controlled pilot.

## Durable file-based rollback (new corrective commit)

1. Start from the latest main in an isolated rollback branch/worktree; preserve existing work. Do not reset or force-push main.
2. Change EVENT_SOURCE to 'file' in content/event-source.mjs. Leave content/site.mjs events empty and leave Sanity data/assets untouched.
3. Run npm run build, npm run check and npm test. Verify both Home and Eventos pages lack data-cms-events-config and display the file catalog empty state.
4. Commit the selector and the four rebuilt Home/Eventos pages as a corrective rollback commit. Preserve unrelated newer changes. Review any conflicts individually.
5. Push/review/merge the rollback under the applicable authorization. The existing main-only Pages process deploys it. Verify the actual live four pages and deployment result.

Reverting only the activation commit is another option if there are no later overlapping changes; verify its exact SHA in the release evidence first. Never delete datasets/assets, reset main or revert the entire merge without reviewing the broader design impact. The recorded pre-pilot main SHA is 6cf697c58b8d4c56a6439bc8cb6c505dc39b76fb. Exact activation/merge/deployment references are recorded in the final release evidence/report after publication.

## Church pilot

Give the church representative GUIA_ADMIN_EVENTOS.md and the Studio URL. Invitation acceptance/sign-in and actual phone/Safari/screen-reader acceptance require a person; do not claim these were automated. Keep the existing technical administrator plus one invited representative. No roles, billing, account or dataset changes are needed.

Live smoke-test records must be uniquely identified as fictional. Remove only records created by that exercise and preserve all unrelated records/assets. Published content should change without a Pages rebuild. Capture deployment and before/after document evidence; public HTML activation alone is insufficient proof.
