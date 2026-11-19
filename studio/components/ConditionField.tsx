import type {StringFieldProps} from 'sanity'

// Keep Sanity's native radio input, keyboard handling and focus styling, while
// replacing the default single-input label with a semantic group heading.
export function ConditionField(props: StringFieldProps) {
  const descriptionId = `${props.inputId}-description`
  const errorsId = `${props.inputId}-errors`
  const errors = props.validation.filter(marker => marker.level === 'error')
  return <fieldset aria-describedby={`${descriptionId} ${errorsId}`}
    aria-invalid={errors.length > 0} style={{border: 0, padding: 0, margin: 0, minWidth: 0}}>
    <legend>{props.title}</legend>
    <p id={descriptionId}>{props.description}</p>
    {props.children}
    <div id={errorsId} role="alert" aria-atomic="true">
      {errors.map((error, index) => <p key={index}>{error.message}</p>)}
    </div>
  </fieldset>
}
