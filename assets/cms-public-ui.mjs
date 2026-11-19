import {mountCmsEvents} from './cms-ui.mjs';

// Activated only in the separately prepared release artifact, never by a normal
// file-based build. No hostname restriction is needed for GitHub Pages hosting.
const configuration = document.querySelector('[data-cms-events-config]');
if (configuration) mountCmsEvents(JSON.parse(configuration.textContent));
