import {createContext, useContext} from 'react'
import {PatchEvent, set, useFormValue, type ObjectInputProps, type StringInputProps} from 'sanity'
import {Card, Flex, Radio, Stack, Text} from '@sanity/ui'
import {church} from '../../content/church.mjs'
import {eventLocationMode, locationChanges} from '../lib/event-location.mjs'
type EventLocation = {locationChoice?: string; venue?: string; location?: string; externalLocationBackup?: {venue?: string; location?: string}}
const LocationChange = createContext<((choice: string) => void) | null>(null)
export function EventInput(props: ObjectInputProps) {
  const document = (props.value || {}) as EventLocation
  return <LocationChange.Provider value={choice => {
    if (props.readOnly) return
    const patches = locationChanges(document, choice).map(change => set(change.value, change.path))
    if (patches.length) props.onChange(PatchEvent.from(patches))
  }}>{props.renderDefault(props)}</LocationChange.Provider>
}
export function LocationInput(props: StringInputProps) {
  const document = (useFormValue([]) || {}) as EventLocation
  const change = useContext(LocationChange)
  const mode = eventLocationMode(document)
  const inputId = props.elementProps.id
  return <Stack gap={3}>
    <fieldset aria-describedby={[inputId + '-summary', props.elementProps['aria-describedby']].filter(Boolean).join(' ')}
      aria-invalid={props.validation.some(marker => marker.level === 'error')}
      style={{border: 0, margin: 0, padding: 0, minWidth: 0}}>
      <legend>Lugar del evento</legend>
      <Stack gap={2}>
        {[['church', 'En nuestra iglesia'], ['external', 'Otra ubicación']].map(([value, label]) =>
          <Card as="label" padding={3} radius={2} border key={value}>
            <Flex align="center" gap={3} style={{minHeight: 28}}>
              <Radio {...props.elementProps} id={value === 'church' ? inputId : inputId + '-external'}
                name={inputId} value={value} checked={mode === value}
                disabled={props.readOnly || !change} onChange={() => change?.(value)} />
              <Text size={1}>{label}</Text>
            </Flex>
          </Card>)}
      </Stack>
    </fieldset>
    <div id={inputId + '-summary'} role="status" style={{overflowWrap: 'anywhere'}}>
      {mode === 'church' ? <p>{document.venue || church.name}<br />{document.location || church.address}</p>
        : <p>Completa el nombre del lugar y la dirección. Se conservan al cambiar a nuestra iglesia y volver.</p>}
    </div>
  </Stack>
}
