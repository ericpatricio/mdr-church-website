import {useEffect, useState} from 'react'
import {useClient} from 'sanity'
import {renderEventCard} from '../../assets/event-rendering.mjs'
import previewStyles from '../../assets/style.css?raw'

type EventDocument = {
  title?: Record<string, string>; description?: Record<string, string>; details?: Record<string, string>;
  start?: string; end?: string; venue?: string; location?: string; condition?: string;
  imageAlt?: Record<string, string>; flyer?: {asset?: {_ref?: string}};
  category?: string; contact?: Record<string, string>; registrationUrl?: string;
}

export function EventPreview({document}: {document: {displayed: EventDocument | null}}) {
  const event = document.displayed
  const client = useClient({apiVersion: '2026-11-17'})
  const [language, setLanguage] = useState('es')
  const [imageUrl, setImageUrl] = useState<string>()
  useEffect(() => {
    let active = true
    setImageUrl(undefined)
    const reference = event?.flyer?.asset?._ref
    if (reference) client.fetch<string | null>('*[_id == $id][0].url', {id: reference})
      .then(url => {if (active && url) setImageUrl(url)})
      .catch(() => {if (active) setImageUrl(undefined)})
    return () => {active = false}
  }, [client, event?.flyer?.asset?._ref])
  if (!event) return <p>No hay contenido para mostrar.</p>
  const validDates = event.start && Number.isFinite(Date.parse(event.start)) &&
    (!event.end || (Number.isFinite(Date.parse(event.end)) && Date.parse(event.end) > Date.parse(event.start)))
  const translations = language === 'es'
    ? {eventDetails: 'Detalles del evento', eventCancelled: 'Cancelado', eventRegister: 'Inscribirme'}
    : {eventDetails: 'Event details', eventCancelled: 'Cancelled', eventRegister: 'Register'}
  const markup = validDates ? renderEventCard({
    ...event,
    status: event.condition === 'cancelled' ? 'cancelled' : 'published',
    title: event.title || {es: 'Título pendiente', en: 'Title pending'},
    description: event.description || {es: '', en: ''},
    details: event.details,
    location: event.location || '',
    imageUrl,
  }, language, translations) : '<p>Completa una fecha válida para ver la tarjeta.</p>'
  const preview = `<!doctype html><html lang="${language}"><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>${previewStyles}</style></head><body><main class="container">${markup}</main></body></html>`
  return <div style={{padding: 24, maxWidth: 800, margin: 'auto'}}>
    <p>Vista previa privada · No publica cambios</p>
    {event.end && Date.parse(event.end) <= Date.now() && <p role="status">Finalizado: este evento ya no aparece en las listas públicas.</p>}
    <label>Idioma <select value={language} onChange={e => setLanguage(e.target.value)}>
      <option value="es">Español</option><option value="en">English</option>
    </select></label>
    <iframe title="Vista previa del evento" sandbox="" srcDoc={preview}
      style={{marginTop: 24, width: '100%', height: 850, border: '1px solid #d9e4ec', background: 'white'}} />
  </div>
}
