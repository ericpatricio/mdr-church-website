# Controlled versioning proposal ? 2026-11-19

Status: review only. Nothing staged, committed, pushed, merged or deployed. No source or asset was discarded. This pass added this report and regenerated ignored verification outputs only.

## Baseline and safe assembly

Current branch development/sanity-events-poc and local main point at 2f40ac596498be7f15c5a75ded81655443cc357f. Connected GitHub read confirms current remote main is 6cf697c58b8d4c56a6439bc8cb6c505dc39b76fb; origin/main agrees. The index is empty. Do not merge this older workspace wholesale or use git add . . After approval, create a separate release branch/worktree from the verified current remote main, copy ONLY the exact manifest below, inspect that diff, and rerun verification. Preserve this workspace and the existing pastoral-file-release worktree unchanged.

The manifest is relative to current remote main, comparing text with CRLF normalized. EVENTS_GUIDE.md, content/site.mjs, content/PUBLISHING.md, assets/ministry-men.PNG, stock provenance/credits, scripts/test-events.mjs and both Eventos pages already match remote main; they do not need another commit. CHECKLIST_APROBACION_PASTORAL.txt and LEEME_PRESENTACION.txt differ because this workspace predates the pastoral release: exclude them and retain the current remote versions. Ten other page statuses are line-ending-only changes relative to local HEAD; exclude that churn. No baseline files are missing.

## Exact proposed commit manifest (51 files)

This is an allowlist, not permission to stage. Generated HTML in this list belongs to the normal file-based build; CMS-activated HTML is deliberately excluded.

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

## Exclusions and artwork

- studio/.sanity/ in full: ignored evidence, cached schema, audit JSON, private local CLI scripts and dependency-remediation sandbox. Specifically dependency-remediation contains baseline manifests, trial Studio source/build/node_modules, asset copies and audit-after.json: 44,648 files / 477,561,745 bytes. It is not release source.
- studio/node_modules/ (44,957 files / 518,346,776 bytes), studio/dist/ (349 files / 8,400,884 bytes), release-preview/ (64 files / 12,391,330 bytes), .cms-poc.json, studio/.env* remain ignored. Track the actual Studio package.json and package-lock.json, not the trial copies.
- assets/stock/men-study.jpg: unused, provenance undocumented in the existing stock README. Preserve locally; exclude from proposed commit. The current preview copier includes it in release-preview/assets/stock/men-study.jpg. This generated artifact is NOT ready for deployment: a future approved clean assembly must exclude this unapproved photo and verify all copied assets. No original is deleted.
- studio/scripts/verify-live.mjs: historical POC tool creates/uploads/publishes test fixtures. Preserve locally, exclude from release commit, and DO NOT run against the intended poc dataset. Its functionality was intentionally not rerun; current read-only remote verification and local fixture tests replace it for this pass.
- Preserve all supplied/legacy artwork. Original waterfall (2,853,436 bytes), 960px WebP (159,514), 1920px WebP (621,856), fallback JPEG (583,521) remain byte-identical to prior baseline. Original men's PNG already on main remains byte-identical. No artwork replacement/deletion in this pass.

## Security: exact residual dependency paths

Full npm audit, including dev dependencies: {"info":0,"low":0,"moderate":13,"high":0,"critical":0,"total":13}. Production-dependency audit agrees. All 13 entries are moderate: one underlying minimatch advisory and 12 inherited package findings, not 13 separate exploits.

| Affected package | Installed paths and versions | Inherited via / advisory |
| --- | --- | --- |
| @oclif/core | studio/node_modules/@oclif/core (4.14.0) | minimatch |
| @oclif/plugin-help | studio/node_modules/@oclif/plugin-help (6.3.0) | @oclif/core |
| @oclif/plugin-not-found | studio/node_modules/@oclif/plugin-not-found (3.3.0) | @oclif/core |
| @sanity-labs/oclif-plugin-skills-flag | studio/node_modules/@sanity-labs/oclif-plugin-skills-flag (0.2.1) | @oclif/core |
| @sanity/blueprints | studio/node_modules/@sanity/blueprints (0.33.0)<br>studio/node_modules/@sanity/runtime-cli/node_modules/@sanity/blueprints (0.34.1) | @sanity/cli-build |
| @sanity/cli | studio/node_modules/@sanity/cli (8.30.0) | @oclif/core, @oclif/plugin-help, @oclif/plugin-not-found, @sanity/blueprints, @sanity/cli-build, @sanity/cli-core, @sanity/runtime-cli, @sanity/workbench-cli, @sanity/workflow-cli |
| @sanity/cli-build | studio/node_modules/@sanity/cli-build (7.2.2) | @oclif/core, @sanity/cli-core, @sanity/workbench-cli, sanity |
| @sanity/cli-core | studio/node_modules/@sanity/cli-core (3.15.1) | @oclif/core |
| @sanity/runtime-cli | studio/node_modules/@sanity/runtime-cli (17.21.5) | @oclif/core, @oclif/plugin-help, @sanity-labs/oclif-plugin-skills-flag, @sanity/blueprints, @sanity/cli-build, @sanity/cli-core |
| @sanity/workbench-cli | studio/node_modules/@sanity/workbench-cli (2.17.0) | @sanity/cli-core |
| @sanity/workflow-cli | studio/node_modules/@sanity/workflow-cli (0.37.0) | @oclif/core, @oclif/plugin-help, @sanity/cli-core |
| minimatch | studio/node_modules/minimatch (10.2.6) | https://github.com/advisories/GHSA-g3hv-75wg-m249 |
| sanity | studio/node_modules/sanity (6.24.0) | @sanity/cli |

Dependency route is sanity -> @sanity/cli -> the CLI/helper paths above -> @oclif/core -> minimatch. The blueprints package has two installed nodes, both recorded above. CLI-build and sanity have cyclic metadata inheritance; npm's audit table is not a list of independent runtime entry points.

[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) describes attacker-controlled glob amplification at optimizationLevel >= 2, causing CPU/memory exhaustion. It affects minimatch >=7 <11.0.1; the listed fix is 11.0.1+. The installed 10.2.6 is affected. Current @oclif/core 4.14.0 requests ^10.2.5, so 11 is outside its supported range. Registry checks confirm core 5.1.12 requests ^11.0.1, while Sanity CLI 8.31.0 still requests core ^4.14.0. No verified compatible in-range fix is available for this chain. npm proposes a semver-major downgrade to Sanity 5.14.1 for most entries, and fixAvailable=true on plugin-not-found; that flag alone does not establish a compatible fix for the shared core chain. Neither is applied. No force fix, new override or major update was made in this pass.

Exposure classification for EVERY row: local CLI/build tooling. The dependency is installed through sanity's CLI graph; it is not used by the dependency-free public website. Prior source-map inspection of the same installed graph found none of minimatch/js-yaml/smol-toml in the Studio browser bundle (333 maps / 2,067 sources); the final distribution has no source maps. This evidence concerns our built hosted Studio client, not Sanity's private hosting infrastructure. No administrator event field is wired to a CLI glob. Realistic exposure is an operator/CI processing untrusted file patterns; impact is local denial of service, not event-data access. Limit tooling to trusted checkout/configuration, avoid untrusted glob inputs, and monitor an upstream supported update. Recommend temporary acceptance with this scope recorded; further remediation requires a separately tested supported upstream dependency transition. Residual risk is not zero and audit is not clean.

Previously accepted scoped @vercel/frameworks@3.29.0 parser overrides remain: js-yaml 3.15.2 and smol-toml 1.9.1. Real YAML/TOML/JSON readers and consumers, invalid input and bounded regression tests passed. No dependency changes were necessary in this audit.

## Content and release safety

- File event catalog is empty; authenticated raw poc query counts zero event documents, including drafts/published variants. No fictional event remains. Existing assets are retained.
- Hosted schema metadata and local Studio/candidate agree: project u2olnd8u, dataset poc. Public requests explicitly use published perspective, exclude drafts/versions, and omit credentials. Studio editing intentionally uses authenticated draft access.
- Exact GitHub origin CORS remains allowCredentials=false. Anonymous actual published query returned 200, empty result, matching origin header and no credential grant.
- Five live GitHub Pages page hashes (root, Spanish/English Home and Eventos) match the earlier baseline. All 86 existing non-Studio local website files match the pre-pass baseline. Normal generated pages remain file-based; only ignored release-preview has CMS startup. Public website and hosted Studio were not deployed or reconfigured.
- Approved responsive hero, logo correction, eight-second autoplay/arrows/counter and hover/focus/hidden/reduced-motion behavior are preserved. No pause/play button was reintroduced.

## Verification

Passed this pass: website build; static validation (20 bilingual pages, 802 local references, 142 images); all website/event/CMS/release tests; prepare:cms; candidate static validation (806 references); Studio build; type-check; semantic field tests; parser compatibility/security regressions; read-only dataset/schema/CORS checks; full and production npm security audits (expected advisory exit 1); live/local baseline hashes; git diff --check (line-ending conversion warnings only). Credential scan and final manifest whitespace checks are recorded in the readiness addendum after this report is written.

No new browser viewport sweep was performed in this versioning-only pass. Earlier 390/768/1440 Spanish/English evidence remains historical evidence, not a new pass. Physical phone/touch, actual screen-reader announcements and final clean-release-worktree browser smoke test remain acceptance gaps. Do not execute the excluded remote mutation fixture just to obtain a test count.

## Proposed commit and rollback strategy

After separate approval, assemble from current remote main using the allowlist. Prefer reviewable commits: (1) approved local hero/responsive refinements and generated file-based pages; (2) dormant CMS integration, Studio, lockfile and tests; (3) release documentation. Keep the website file-based through these commits. Build/tests must run again in the assembled clean worktree because this workspace's branch baseline is older. No temporary artifacts belong in any commit.

Future CMS activation must be a separate, explicitly authorized commit containing the four Home/Eventos bootstrap changes. Record its hash and the preceding known-good file-based release. Rollback is a new revert commit of activation (or restore those four normal generated pages and validate), then an independently authorized deployment. Never reset history or delete Sanity datasets/assets. A visual change can separately be reverted by its own commit without undoing Studio/security changes. If a future merge commit is reverted, select its verified first parent; do not guess. No rollback command is executed now.

Final verification: credential scan passed across 447 source/build text files, including this manifest; no session-token match or private credential pattern was found. All 51 allowlisted paths exist; all 46 text files passed trailing-whitespace and conflict-marker checks. git diff --check passed and the index remains empty. These checks detect known patterns and the current session token; they cannot guarantee detection of every secret format.

Approval gates: accept/resolve the scoped moderate tooling risk; approve exact source manifest and future clean branch assembly; exclude the undocumented photo from deployable packaging; complete/accept remaining manual accessibility/device checks; separately authorize commit/push/merge and deployment. No deployment authorization is implied by this document.
