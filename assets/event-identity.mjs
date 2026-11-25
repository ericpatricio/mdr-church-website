// Sanity owns uniqueness. Encode immutable ASCII IDs losslessly into URL-safe keys.
export function eventIdentity(documentId) {
  if (typeof documentId !== 'string' || !/^[A-Za-z0-9_-]+$/.test(documentId))
    throw new Error('No se pudo establecer el identificador del evento. Reabre el evento y avisa al administrador técnico si continúa.');
  return 'event-' + [...documentId].map(character => character.charCodeAt(0).toString(16).padStart(2, '0')).join('');
}
