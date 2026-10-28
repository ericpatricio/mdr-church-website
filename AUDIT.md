# Phase A audit — October 28, 2026

## Existing architecture and retained work

The merged repository is a buildless static HTML/CSS/JavaScript website. A Node generator creates six pages in each language; a static server exercises the GitHub Pages subpath. There are no dependencies or lint configuration. Retain this architecture, relative URLs, authentic assets, menu semantics, direct language counterparts, and existing verified address/schedule.

## Assets inspected

Original MDR logo screenshot (289 x 273); original Instagram worship image optimized to 1920 x 1132; worship screenshot; church exterior WebP (680 x 510); original 150px Kidzz, Next, Mujeres and Anuncios highlight logos; older generated spring illustration and conceptual SVG illustrations. No specifically identified pastoral portrait or approved biography. A second authentic worship image exists in the owner-supplied saved Instagram folder and is suitable for community imagery.

## Findings

The existing navigation and hero links are functional, with keyboard focus styles and menu Escape support. The homepage lacks several requested sections and the header visit CTA. Service names are missing. Ministry directory items lack detail links. The generator and stylesheet are densely formatted and difficult to update. Small body/navigation text and repeated card compositions weaken the design. The old checker treats fragment anchors as filenames and cannot validate their targets.

No verified upcoming special-event calendar or sermon catalog is available. No histories, ministry program descriptions, leaders, ages, parking or childcare arrangements should be inferred from image labels or reviews.

## Maps verification

Owner URL: https://maps.app.goo.gl/KA19Zd9LzB7ytgrU6
Browser resolved the listing for Iglesia de Dios Manantial de Restauración. Listing address: 4360 Monterey Rd, Kissimmee, FL 34758. Listed phone: (407) 346-5036. Opening hours were not treated as service times. Reviewer statements were not used as official service/program claims. No Google Maps reviews or third-party imagery were republished.

## Design research

- https://www.efcc.org/: visitor-oriented invitation, plan-a-visit path, community connection and location/service information.
- https://www.vouschurch.com/: focused action navigation, location discovery and distinct calendar content.
- https://www.churchofthehighlands.com/: clear visitor/message paths and structured ministry/next-step groups.
- https://www.life.church/: page exposed minimal readable content through research tools; visual and interaction evaluation limited.

These are structural observations from accessible page content; no copyrighted copy, photography, branding or proprietary assets are reused, and no mobile audit of these reference sites is claimed.

## Proposed implementation, presented in chat before edits

Retain the static stack. Separate bilingual content from templates, preserve original logo and authentic photos, use a clean editorial homepage with the required sequence, add leadership names without fictional portraits/biographies, provide ministry detail anchors, verified Maps directions and contact, improve typography/spacing and mobile navigation, and implement truthful event filters. Complete all secondary pages consistently. Validate five specified widths, keyboard interactions, language routing, asset loading, console logs, links and subpath support. Work on a new development branch; prepare a review PR and screenshots without deployment.
