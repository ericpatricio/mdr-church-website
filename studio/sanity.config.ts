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
      structure: S => S.documentTypeList('event').title('Eventos'),
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
      ['publish', 'delete', 'unpublish', 'discardChanges', 'restore'].includes(action.action || '')),
  },
})
