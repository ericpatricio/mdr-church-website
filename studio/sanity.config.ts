import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {esESLocale} from '@sanity/locale-es-es'
import {event} from './schema/event'
import {EventPreview} from './components/EventPreview'

export default defineConfig({
  name: 'mdr-events-poc',
  title: 'MDR · Eventos',
  projectId: 'u2olnd8u',
  dataset: 'poc',
  releases: {enabled: false},
  auth: {
    providers: providers => providers.filter(provider => ['google', 'sanity'].includes(provider.name)),
  },
  plugins: [
    esESLocale(),
    structureTool({
      title: 'Eventos',
      structure: S => S.list().title('Eventos').items([
        S.listItem().title('Todos los eventos y borradores').child(S.documentTypeList('event').title('Todos los eventos y borradores')),
        ...[
          ['Próximos eventos', 'condition != "cancelled" && start > now() && coalesce(end, start) > now()'],
          ['En curso', 'condition != "cancelled" && start <= now() && end > now()'],
          ['Finalizados', 'coalesce(end, start) <= now()'],
          ['Cancelados', 'condition == "cancelled"'],
        ].map(([title, filter]) => S.listItem().title(title).child(
          S.documentList().title(title).schemaType('event')
            .apiVersion('2026-11-17').filter('_type == "event" && (' + filter + ')')
            .defaultOrdering([{field: 'start', direction: 'desc'}]),
        )),
      ]),
      defaultDocumentNode: S => S.document().views([
        S.view.form().title('Editar'),
        S.view.component(EventPreview).title('Vista previa'),
      ]),
    }),
  ],
  schema: {types: [event]},
  document: {
    comments: {enabled: false},
    // Native publishing/deletion preserve validation, confirmation and draft semantics.
    actions: actions => actions.filter(action =>
      ['publish', 'delete', 'unpublish', 'discardChanges', 'restore', 'duplicate'].includes(action.action || '')),
  },
})
