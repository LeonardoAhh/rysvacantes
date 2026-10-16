import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@/lib/utils"
import type { VacancyFormValues } from "./vacancy-types"
import { VacancyFieldError } from "./vacancy-field-error"
import { VacancyOptionSelect } from "./vacancy-option-select"
import {
  vacancyTextFields,
  type VacancyFormErrors,
} from "./vacancy-form-validation"

type ProfileField = "education" | "experience" | "requirements"

const fields = [
  { name: "education", placeholder: "Ej. Secundaria concluida" },
  {
    name: "experience",
    placeholder: "Ej. Sin experiencia o 1 año en producción",
  },
  {
    name: "requirements",
    placeholder:
      "Ej. Manejo de instrumentos de medición\nLectura de planos\nTrabajo en equipo",
  },
] as const

export function VacancyRequirementsFields({
  values,
  errors,
  onChange,
  onBlur,
}: {
  values: VacancyFormValues
  errors: VacancyFormErrors
  onChange: (field: ProfileField, value: string) => void
  onBlur: (field: ProfileField) => void
}) {
  return (
    <>
      <p
        className="vacancy-field-hint vacancy-form-field-wide"
        id="vacancy-profile-hint"
      >
        Describe el perfil que buscas para el puesto. Estos campos son
        opcionales.
      </p>
      {fields.map(({ name, placeholder }) => {
        const id = `vacancy-${name}`
        const Control = name === "requirements" ? Textarea : Input
        return (
          <div
            className={cn(
              "vacancy-form-field",
              name === "requirements" && "vacancy-form-field-wide"
            )}
            key={name}
          >
            <Label htmlFor={id}>{vacancyTextFields[name].label}</Label>
            {name === "education" ? (
              <VacancyOptionSelect
                field="education"
                value={values.education}
                error={errors.education}
                optional
                describedBy="vacancy-profile-hint"
                onChange={(value) => onChange("education", value)}
                onBlur={() => onBlur("education")}
              />
            ) : (
              <Control
                aria-describedby={`vacancy-profile-hint${name === "requirements" ? " vacancy-requirements-hint" : ""}${errors[name] ? ` ${id}-error` : ""}`}
                aria-invalid={Boolean(errors[name])}
                id={id}
                maxLength={vacancyTextFields[name].maxLength}
                onBlur={() => onBlur(name)}
                onChange={(event) => onChange(name, event.target.value)}
                placeholder={placeholder}
                value={values[name]}
              />
            )}
            {name === "requirements" && (
              <p className="vacancy-field-hint" id="vacancy-requirements-hint">
                Escribe un conocimiento o habilidad por renglón.
              </p>
            )}
            <VacancyFieldError field={id} message={errors[name]} />
          </div>
        )
      })}
    </>
  )
}
