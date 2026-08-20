import { IconAlertCircle } from "./icons.jsx";

let idCounter = 0;

// Envoltorio visual de label+input. No agrega logica: recibe el value y el
// onChange del padre y los pasa tal cual al elemento nativo, para no tocar
// el comportamiento de formularios existente.
export default function FormField({
  label,
  icon,
  error,
  as = "input",
  children,
  id,
  required,
  ...inputProps
}) {
  const fieldId = id || `field-${(idCounter += 1)}`;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={fieldId}>
        {label}
        {required && <span aria-hidden="true">*</span>}
      </label>
      <div className="form-field__control-wrap">
        {icon && <span className="form-field__icon">{icon}</span>}
        {as === "select" ? (
          <select
            id={fieldId}
            data-has-icon={Boolean(icon)}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId}
            {...inputProps}
          >
            {children}
          </select>
        ) : (
          <input
            id={fieldId}
            data-has-icon={Boolean(icon)}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId}
            required={required}
            {...inputProps}
          />
        )}
      </div>
      {error && (
        <span className="form-field__error" id={errorId} role="alert">
          <IconAlertCircle width={14} height={14} />
          {error}
        </span>
      )}
    </div>
  );
}
