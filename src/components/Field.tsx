type FieldProps = {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  step?: string;
  autoComplete?: string;
};

// A labelled input with its error message, linked for screen readers
export function Field({ name, label, error, hint, ...inputProps }: FieldProps) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {hint && (
        <span id={hintId} className="hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className="error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
