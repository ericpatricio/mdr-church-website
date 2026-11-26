import {defineField, defineType} from 'sanity'
import {ConditionField} from '../components/ConditionField'
import {EventInput, LocationInput} from '../components/EventInput'
import {church} from '../../content/church.mjs'
import {eventLocationMode, newEventDefaults, validateVenue, validateAddress} from '../lib/event-location.mjs'
import {validateDocumentIdentity, validateEnd, optionalBilingual} from '../lib/event-validation.mjs'

const translated = (name: string, title: string, multiline = false, optional = false) => defineField({
  name, title, type: 'object', fieldset: optional ? 'additional' : name === 'imageAlt' ? 'flyer' : 'information',
  fields: ['es', 'en'].map(language => defineField({
    name: language, title: language === 'es' ? 'Español' : 'Inglés',
    type: multiline ? 'text' : 'string',
    ...(optional ? {} : {validation: (rule: any) => rule.custom((value: unknown) =>
      typeof value === 'string' && value.trim() ? true : 'Escribe este contenido en ambos idiomas.')}),
  })),
  validation: rule => rule.custom(value => optional ? optionalBilingual(value)
    : value ? true : 'Completa el contenido en español e inglés.'),
})

export const event = defineType({
  name: 'event', title: 'Evento', type: 'document',
  description: 'Al publicar, el evento estará disponible en el sitio web de la iglesia. Los cambios pueden tardar unos instantes en reflejarse. Los volantes son públicos por URL, incluso en borrador.',
  components: {input: EventInput},
  initialValue: newEventDefaults,
  validation: rule => rule.custom(value => validateDocumentIdentity(value)),
  fieldsets: [
    {name: 'information', title: '1. Información del evento'},
    {name: 'schedule', title: '2. Fecha y horario'},
    {name: 'place', title: '3. Lugar del evento'},
    {name: 'flyer', title: '4. Volante'},
    {name: 'additional', title: '5. Información adicional (opcional)', options: {collapsible: true, collapsed: true}},
    {name: 'publication', title: '6. Vista previa y publicación'},
  ],
  fields: [
    translated('title', 'Título'),
    // Legacy values remain stored and immutable. Sanity's document ID is the key.
    defineField({name: 'slug', title: 'Identificador anterior', type: 'slug', hidden: true, readOnly: true,
      // Retained metadata, not event identity. Native document IDs own uniqueness.
      options: {isUnique: () => true},
    }),
    translated('description', 'Descripción del evento', true),
    translated('details', 'Detalles adicionales (opcional)', true, true),
    defineField({name: 'start', title: 'Inicio', type: 'datetime', fieldset: 'schedule',
      options: {displayTimeZone: church.timeZone, allowTimeZoneSwitch: false},
      description: 'Hora local de nuestra iglesia (Nueva York / Florida). Comprueba la hora antes de publicar.',
      validation: rule => rule.custom(value => typeof value === 'string' && Number.isFinite(Date.parse(value)) || 'Indica la fecha y hora de inicio.'),
    }),
    defineField({name: 'end', title: 'Finalización', type: 'datetime', fieldset: 'schedule',
      options: {displayTimeZone: church.timeZone, allowTimeZoneSwitch: false},
      description: 'El evento dejará de aparecer automáticamente en el sitio web al llegar la fecha y hora de finalización.',
      validation: rule => rule.custom((value, context) => validateEnd(value, context.document)),
    }),
    defineField({name: 'timeZone', title: 'Zona horaria', type: 'string',
      hidden: ({document}) => document?.timeZone === church.timeZone,
      initialValue: church.timeZone, options: {list: [{title: 'Hora local de la iglesia', value: church.timeZone}]},
      validation: rule => rule.custom(value => value === church.timeZone || 'Selecciona Hora local de la iglesia.'),
    }),
    defineField({name: 'locationChoice', title: 'Ubicación', type: 'string', fieldset: 'place',
      components: {input: LocationInput}, options: {list: ['church', 'external']},
      validation: rule => rule.custom(value => value === undefined || ['church', 'external'].includes(value) || 'Selecciona el lugar del evento.'),
    }),
    defineField({name: 'venue', title: 'Nombre del lugar', type: 'string', fieldset: 'place',
      hidden: ({document}) => eventLocationMode(document) === 'church',
      validation: rule => rule.custom((value, context) => validateVenue(value, context.document)),
    }),
    defineField({name: 'location', title: 'Dirección', type: 'string', fieldset: 'place',
      hidden: ({document}) => eventLocationMode(document) === 'church',
      validation: rule => rule.custom((value, context) => validateAddress(value, context.document)),
    }),
    defineField({name: 'externalLocationBackup', title: 'Ubicación alternativa conservada', type: 'object',
      hidden: true, readOnly: true, fields: [
        defineField({name: 'venue', type: 'string'}), defineField({name: 'location', type: 'string'}),
      ],
    }),
    defineField({name: 'flyer', title: 'Volante', type: 'image', fieldset: 'flyer',
      description: 'JPG, PNG o WebP; máximo 5 MB. No subas información privada: el archivo es público por URL.',
      options: {accept: 'image/jpeg,image/png,image/webp'},
      validation: rule => rule.custom(async (value, context) => {
        const reference = value?.asset?._ref
        if (!reference) return 'Sube el volante del evento.'
        try {
          const asset = await context.getClient({apiVersion: '2026-11-17'}).fetch<{mimeType: string; size: number} | null>(
            '*[_id == $id][0]{mimeType,size}', {id: reference})
          return Boolean(asset && ['image/jpeg', 'image/png', 'image/webp'].includes(asset.mimeType) &&
            asset.size > 0 && asset.size <= 5 * 1024 * 1024) || 'Usa JPG, PNG o WebP de máximo 5 MB.'
        } catch {return 'No se pudo comprobar el volante. Reintenta antes de publicar.'}
      }),
    }),
    translated('imageAlt', 'Descripción accesible del volante'),
    defineField({name: 'category', title: 'Categoría', type: 'string', fieldset: 'additional',
      description: 'Comunidad viene seleccionada. Cambia a Culto especial solo cuando corresponda.',
      options: {list: [{title: 'Comunidad', value: 'community'}, {title: 'Culto especial', value: 'worship'}]},
      validation: rule => rule.custom(value => ['community', 'worship'].includes(value || '') || 'Selecciona una categoría.'),
    }),
    defineField({name: 'registrationUrl', title: 'Enlace de inscripción (opcional)', type: 'url', fieldset: 'additional',
      validation: rule => rule.uri({scheme: ['https']}),
    }),
    // Not consumed by public cards; retain editable provenance in the optional section.
    defineField({name: 'sourceUrl', title: 'Fuente oficial (opcional)', type: 'url', fieldset: 'additional',
      validation: rule => rule.uri({scheme: ['https']}),
    }),
    defineField({name: 'contact', title: 'Contacto verificado (opcional)', type: 'object', fieldset: 'additional',
      fields: ['es', 'en'].map(language => defineField({name: language, title: language === 'es' ? 'Español' : 'Inglés', type: 'string'})),
      validation: rule => rule.custom(optionalBilingual),
    }),
    defineField({name: 'condition', title: 'Estado del encuentro', type: 'string', fieldset: 'publication',
      components: {field: ConditionField},
      description: 'Revisa Vista previa. Para cancelar, selecciona Cancelado y pulsa Publicar. Guardar un borrador no cambia el sitio.',
      options: {list: [{title: 'Programado', value: 'scheduled'}, {title: 'Cancelado', value: 'cancelled'}], layout: 'radio'},
      validation: rule => rule.custom(value => ['scheduled', 'cancelled'].includes(value || '') || 'Selecciona un estado.'),
    }),
  ],
  preview: {
    select: {title: 'title.es', media: 'flyer', condition: 'condition', start: 'start', end: 'end'},
    prepare: ({title, media, condition, start, end}) => ({title: title || 'Evento sin título', media,
      subtitle: condition === 'cancelled' ? 'Cancelado' : Date.parse(end || start) <= Date.now() ? 'Finalizado'
        : Date.parse(start) <= Date.now() ? 'En curso' : 'Próximo'}),
  },
})
