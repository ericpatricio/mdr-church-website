# MDR Sanity events proof of concept

Status: historical POC instructions. Studio is deployed at
https://mdr-eventos.sanity.studio/ and administrator access has been confirmed.
The public website remains file-based. See [SANITY_RELEASE_READINESS.md](SANITY_RELEASE_READINESS.md)
for the current local-only website release candidate, approval gates and rollback.
Do not run `studio/scripts/verify-live.mjs` against the intended release dataset:
that historical POC script creates and publishes fictional fixtures.

## Verified exercise — November 18, 2026

The administrator signed in with Google and verified bilingual draft preview,
draft exclusion, publishing on both Eventos pages and homepages, New York time
correction, private unpublished edits, flyer replacement, republishing,
cancellation labels/homepage exclusion, and deletion. All four local listings
returned to their empty states. A subsequent anonymous API read confirmed the
published test feed is empty, and the file-based catalog is also empty.

The exercise exposed a browser-only fetch receiver error: storing native fetch
as an object method failed in Chrome, while Node accepted it. The adapter now
calls globalThis.fetch through a wrapper. A regression test first reproduced
the failure, then passed with the correction. Failed requests now produce a
local console warning instead of silently hiding their diagnostic message.

The earlier live API test also verified draft denial, image upload/replacement,
native publish/delete, cancellation and cleanup using isolated fixtures. Outage
and stale-data behavior are automated/mock-tested. Full viewport, keyboard,
screen-reader, phone usability and production quota assessments remain pending.

## Isolation and costs

- Branch: `development/sanity-events-poc`. Earlier uncommitted refactor work was
  retained, with a backup at `C:\Users\ericw\AppData\Local\Temp\mdr-before-sanity-dCFX8e`.
- Existing Sanity project: `MDR-events` (`u2olnd8u`). Its $0 Growth Trial will
  automatically become Free. Use only Free-compatible features, no billing upgrade.
- Dedicated public test dataset: `poc`. Do not use, rename or modify `production`.
- Account registration and login are performed by the authorized representative.
  Do not share passwords, login links or API tokens in chat or source files.
- Use fictional records and non-sensitive flyers only. Uploaded dataset assets
  are publicly readable by URL even when the event is still a draft.

## Local commands

Node.js 22.12 or later is required for the separate Studio. Public file-based
development still has no package dependencies. Studio dependencies are isolated
under `studio/`, with a lockfile for reproducible installation.

At the repository root:

```powershell
npm.cmd run build
npm.cmd run check
npm.cmd test
npm.cmd run dev:poc
```

Open `http://127.0.0.1:4173/mdr-church-website/es/eventos.html` and its English
counterpart. Both homepages also receive CMS data in this mode. If a prior preview
server is running, stop it before starting this command.

In another terminal:

```powershell
cd studio
npm.cmd ci
npm.cmd run typecheck
npm.cmd run build
npm.cmd run dev
```

Studio runs at `http://127.0.0.1:3333`. A Studio build creates local output only;
it does not deploy. There is deliberately no deployment script.

The CLI may need permission to read the Windows account profile outside the
sandbox. Do not treat that as evidence of a failed Sanity login.

## One-time project setup — user login required

The authorized representative must log into Sanity personally. When CLI login
is needed, run this inside `studio/` and use the same sign-in method as the account
owner. This POC administrator uses Google; do not create a separate email/password
identity for the same email:

```powershell
npx.cmd sanity login
npx.cmd sanity dataset list
```

After verifying project `u2olnd8u` and confirming `poc` does not already exist,
create only the test dataset (creation was authorized):

```powershell
npx.cmd sanity dataset create poc --visibility public
```

Verify visibility in Sanity Manage. Keep the existing `production` dataset intact.
Verify that the only authorized administrator is the intended church representative.
Do not invite additional users or use paid editor roles.

Configure exact development origins in the project's API/CORS settings:

- `http://127.0.0.1:3333` for authenticated Studio access.
- `http://127.0.0.1:4173` for anonymous public website reads, without credentials.

If opening a phone to test later, loopback addresses refer to that phone, not the
development computer. A separately reviewed access method is needed; do not expose
the local servers broadly or add wildcard credentialed CORS origins.

## Management exercise

The only content type is Evento. The administrator needs no GitHub account.
Fields and instructions are Spanish-first; Spanish and English content live in
one document. Native Sanity drafts control publication independently of the
Programado/Cancelado condition.

1. Create a fictional draft with both languages and future New York dates.
2. Upload a non-sensitive JPG, PNG or WebP flyer, at most 5 MB. Add both alt texts.
3. Open Vista previa and switch language. Preview reads the authenticated
   document; the public website never receives draft credentials.
4. Confirm the draft is absent from both public language pages and homepages.
5. Publish and verify appearance without rebuilding the website.
6. Edit the title and replace the flyer, but do not publish: the previous public
   revision must remain visible. Republish and verify the new revision.
7. Select Cancelado and publish. Eventos keeps the cancellation label; Home omits it.
8. Use the native Eliminar action and its confirmation. Confirm removal publicly.
9. Leave the test dataset empty after the exercise. Do not delete the project,
   dataset or shared assets as an automatic cleanup step.

The public API uses the explicit `published` perspective, no cookies or tokens,
and only the `poc` dataset. Client-side validation also rejects draft/version IDs,
invalid data and flyers outside this project's test dataset. Query filters alone
are not authorization: unauthenticated direct draft access must also be tested
against the real service before acceptance.

Studio validation helps the administrator; it is not a server-side ACL. The public
reader independently validates responses and rejects invalid payloads. CORS does
not replace authentication or document permissions.

## Refresh and outages

The public adapter refreshes on load, about every 60 seconds while visible, and
when returning to the tab. It uses the direct API, not the query CDN. Requests time
out after 10 seconds; failures retry after 30, 60, then 120 seconds. Expiration
continues to use the visitor's device clock.

Failures show a translated warning. Prior successful data is marked as possibly
outdated for up to five minutes; then cards are hidden. A successful empty response
shows the genuine empty state. No previous data means immediate unavailability on
failure. Cache is memory-only. A cancellation/deletion cannot be confirmed current
during an outage, so stale data is never retained indefinitely. API quotas and
actual traffic must be evaluated before any production decision.

## Production remains file-based

`npm.cmd run dev` and `npm.cmd run build` still use `content/site.mjs`. Only
`npm.cmd run dev:poc` injects the CMS script into local Home and Eventos responses.
It does not write CMS configuration or records into generated HTML. The server
binds to loopback and does not serve Studio source or dotfiles. Public code has
no write credential or preview token.

Rollback: stop both servers, then run `npm.cmd run dev` to return immediately to
the file-based preview. Rebuild and run check/test. Preserve all pre-POC changes;
use the backup/diff to reverse only POC edits, never reset the whole working tree.
Remote data can be retained for inspection. Its deletion requires separate consent.

## Verification required before acceptance

Automated tests cover normalization, query configuration, draft/version rejection,
cancelled/expired records, mocked timeout/outage/recovery, and injection in local
CMS mode versus normal mode. Studio typecheck/build are separate checks.

Real-service checks completed: login, membership, public test dataset,
upload/replacement, native publish/edit/cancel/delete, anonymous draft denial,
CORS, and propagation to local pages. These results are distinct from mock tests.

Also verify Spanish/English Home and Eventos at 390, 768 and 1440 pixels, keyboard
use, language switching, actual image loads, overflow and browser console. Test
with the administrator on their phone before production adoption. No production
decision, push, merge or deployment is authorized by this proof of concept.
