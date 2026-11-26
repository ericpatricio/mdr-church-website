import {church} from '../../content/church.mjs';
export function eventLocationMode(document = {}) {
  if (document.locationChoice === 'external') return 'external';
  if (document.locationChoice === 'church') return 'church';
  return document.venue === church.name && document.location === church.address ? 'church' : 'external';
}
export const newEventDefaults = () => ({
  condition: 'scheduled', timeZone: church.timeZone,
  locationChoice: 'church', venue: church.name, location: church.address,
});
// Only explicit selector changes emit atomic root form patches. No mount effects.
export function locationChanges(document, next) {
  if (!['church', 'external'].includes(next)) throw new Error('Lugar no válido.');
  if (eventLocationMode(document) === next && (next !== 'church' ||
      (document.venue === church.name && document.location === church.address))) return [];
  if (next === 'church') return [
    {path: ['externalLocationBackup'], value: {venue: document.venue || '', location: document.location || ''}},
    {path: ['venue'], value: church.name}, {path: ['location'], value: church.address},
    {path: ['locationChoice'], value: 'church'},
  ];
  const backup = document.externalLocationBackup || {};
  return [{path: ['venue'], value: backup.venue || ''},
    {path: ['location'], value: backup.location || ''}, {path: ['locationChoice'], value: 'external'}];
}
export function validateVenue(value, document = {}) {
  if (typeof value !== 'string' || !value.trim()) return 'Escribe el nombre del lugar.';
  return eventLocationMode(document) !== 'church' || value === church.name ||
    'Selecciona Otra ubicación o vuelve a seleccionar En nuestra iglesia.';
}
export function validateAddress(value, document = {}) {
  if (typeof value !== 'string' || !value.trim()) return 'Escribe la dirección del evento.';
  return eventLocationMode(document) !== 'church' || value === church.address ||
    'Selecciona Otra ubicación o vuelve a seleccionar En nuestra iglesia.';
}
