import {eventIdentity} from '../../assets/event-identity.mjs';
export function validateDocumentIdentity(document) {
  try {eventIdentity(document?._id?.replace(/^drafts\./, '')); return true;}
  catch (error) {return error.message;}
}
export function validateEnd(value, document = {}) {
  if (!value || !Number.isFinite(Date.parse(value))) return 'Indica la fecha y hora de finalización.';
  if (!document.start || !Number.isFinite(Date.parse(document.start))) return true;
  return Date.parse(value) > Date.parse(document.start) || 'La finalización debe ser posterior al inicio.';
}
export function optionalBilingual(value) {
  const text = item => typeof item === 'string' && item.trim().length > 0;
  if (!value || ((!value.es || value.es === '') && (!value.en || value.en === ''))) return true;
  if (typeof value.es === 'string' && typeof value.en === 'string' && !value.es.trim() && !value.en.trim()) return true;
  return Boolean(text(value.es) && text(value.en)) || 'Completa ambos idiomas o deja ambos vacíos.';
}
