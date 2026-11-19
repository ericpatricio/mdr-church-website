import {mountCmsEvents} from './cms-ui.mjs';
const configuration = document.querySelector('[data-cms-poc-config]');
if (configuration && ['127.0.0.1', 'localhost'].includes(location.hostname)) {
  mountCmsEvents(JSON.parse(configuration.textContent), {preview: true});
}
