import {defineField, defineType} from 'sanity'
import {ConditionField} from '../components/ConditionField'

const translated = (name: string, title: string, multiline = false) => defineField({
  name, title, type: 'object',
  fields: ['es', 'en'].map(language => defineField({
    name: language, title: language === 'es' ? 'Español' : 'Inglés',
    type: multiline ? 'text' : 'string',
    validation: rule => rule.required().custom(value =>
      typeof value === 'string' && value.trim() ? true : 'Escribe el contenido en ambos idiomas.'),
  })),
  validation: rule => rule.required(),
})

export const event = defineType({
  name: 'event', title: 'Evento', type: 'document',
  description: 'Los volantes subidos son públicos por URL, incluso en borrador. Publicar aquí no actualiza el sitio público MDR todavía.',
  initialValue: {condition: 'scheduled', timeZone: 'America/New_York', category: 'community'},
  fields: [
    translated('title', 'Título'),
    defineField({name: 'slug', title: 'Identificador', type: 'slug',
      options: {source: 'title.es'},
      validation: rule => rule.required().custom(value =>
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value?.current || '') || 'Usa letras minúsculas, números y guiones.'),
    }),
    translated('description', 'Descripción', true),
    translated('details', 'Detalles', true),
    defineField({name: 'start', title: 'Inicio', type: 'datetime',
      options: {displayTimeZone: 'America/New_York', allowTimeZoneSwitch: false},
      description: 'Introduce la hora con la zona America/New_York seleccionada. Comprueba el horario de verano.',
      validation: rule => rule.required(),
    }),
    defineField({name: 'end', title: 'Fin (opcional)', type: 'datetime',
      options: {displayTimeZone: 'America/New_York', allowTimeZoneSwitch: false},
      description: 'Si no hay fin, el evento deja de aparecer al comenzar.',
      validation: rule => rule.custom((value, context) => {
        if (!value) return true
        return Date.parse(value) > Date.parse(String(context.document?.start)) || 'El fin debe ser posterior al inicio.'
      }),
    }),
    defineField({name: 'timeZone', title: 'Zona horaria', type: 'string', readOnly: true,
      initialValue: 'America/New_York', validation: rule => rule.required().custom(value => value === 'America/New_York' || 'Usa America/New_York.'),
    }),
    defineField({name: 'category', title: 'Categoría', type: 'string',
      options: {list: [{title: 'Comunidad', value: 'community'}, {title: 'Culto especial', value: 'worship'}]},
      validation: rule => rule.required().custom(value => ['community', 'worship'].includes(value || '') || 'Selecciona una categoría.'),
    }),
    defineField({name: 'venue', title: 'Nombre del lugar', type: 'string', validation: rule => rule.required()}),
    defineField({name: 'location', title: 'Dirección', type: 'string', validation: rule => rule.required()}),
    defineField({name: 'flyer', title: 'Volante', type: 'image',
      description: 'Solo imágenes no sensibles. El archivo se puede consultar por URL antes de publicar.',
      options: {accept: 'image/jpeg,image/png,image/webp'},
      validation: rule => rule.required().custom(async (value, context) => {
        const reference = value?.asset?._ref
        if (!reference) return 'Sube un volante.'
        try {
          const asset = await context.getClient({apiVersion: '2026-11-17'}).fetch<{mimeType: string; size: number} | null>(
            '*[_id == $id][0]{mimeType,size}', {id: reference})
          return Boolean(asset && ['image/jpeg', 'image/png', 'image/webp'].includes(asset.mimeType) &&
            asset.size > 0 && asset.size <= 5 * 1024 * 1024) || 'Usa JPG, PNG o WebP de máximo 5 MB.'
        } catch {return 'No se pudo comprobar el volante. Reintenta antes de publicar.'}
      }),
    }),
    translated('imageAlt', 'Descripción accesible del volante'),
    defineField({name: 'condition', title: 'Estado del encuentro', type: 'string',
      components: {field: ConditionField},
      description: 'Para cancelar: selecciona Cancelado y pulsa Publicar. Guardar un borrador no cambia el sitio.',
      options: {list: [{title: 'Programado', value: 'scheduled'}, {title: 'Cancelado', value: 'cancelled'}], layout: 'radio'},
      validation: rule => rule.required().custom(value => ['scheduled', 'cancelled'].includes(value || '') || 'Selecciona un estado.'),
    }),
    defineField({name: 'registrationUrl', title: 'Enlace de inscripción (opcional)', type: 'url',
      validation: rule => rule.uri({scheme: ['https']}),
    }),
    defineField({name: 'sourceUrl', title: 'Fuente oficial (opcional)', type: 'url',
      validation: rule => rule.uri({scheme: ['https']}),
    }),
    defineField({name: 'contact', title: 'Contacto verificado (opcional)', type: 'object',
      fields: ['es', 'en'].map(language => defineField({name: language, title: language === 'es' ? 'Español' : 'Inglés', type: 'string'})),
      validation: rule => rule.custom(value => !value ||
        (typeof value.es === 'string' && value.es.trim() && typeof value.en === 'string' && value.en.trim())
        ? true : 'Completa ambos idiomas o elimina el contacto.'),
    }),
  ],
  preview: {
    select: {title: 'title.es', media: 'flyer', condition: 'condition'},
    prepare: ({title, media, condition}) => ({title: title || 'Evento sin título', media,
      subtitle: condition === 'cancelled' ? 'Cancelado' : 'Programado'}),
  },
})
