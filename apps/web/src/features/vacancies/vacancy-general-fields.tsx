import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { VacancyFieldError } from "./vacancy-field-error"
import { getVacancyFieldId } from "./vacancy-form-steps"
import {
  vacancyTextFields,
  type VacancyFormErrors,
  type VacancyTextField,
} from "./vacancy-form-validation"
import {
  isVacancyStatus,
  vacancyStatusLabels,
  vacancyStatuses,
  type VacancyFormValues,
} from "./vacancy-types"

type GeneralTextField =
  "title" | "area" | "location" | "modality" | "employmentType"

const identityFields = ["title", "area", "location"] as const
const conditionFields = ["modality", "employmentType"] as const
const placeholders: Partial<Record<GeneralTextField, string>> = {
  modality: "Presencial, híbrida...",
  employmentType: "Tiempo completo...",
}

type VacancyGeneralFieldsProps = {
  section: "identity" | "conditions"
  values: VacancyFormValues
  errors: VacancyFormErrors
  minimumDeadline: string
  onChange: <Key extends keyof VacancyFormValues>(
    field: Key,
    value: VacancyFormValues[Key]
  ) => void
  onBlur: (field: VacancyTextField) => void
  onDeadlineBlur: () => void
}

export function VacancyGeneralFields({
  section,
  values,
  errors,
  minimumDeadline,
  onChange,
  onBlur,
  onDeadlineBlur,
}: VacancyGeneralFieldsProps) {
  const fields = section === "identity" ? identityFields : conditionFields

  return (
    <>
      {fields.map((field) => {
        const id = getVacancyFieldId(field)
        return (
          <div
            className={
              field === "title"
                ? "vacancy-form-field vacancy-form-field-wide"
                : "vacancy-form-field"
            }
            key={field}
          >
            <Label htmlFor={id}>{vacancyTextFields[field].label}</Label>
            <Input
              aria-describedby={errors[field] ? `${id}-error` : undefined}
              aria-invalid={Boolean(errors[field])}
              autoFocus={field === "title"}
              id={id}
              maxLength={vacancyTextFields[field].maxLength}
              onBlur={() => onBlur(field)}
              onChange={(event) => onChange(field, event.target.value)}
              placeholder={placeholders[field]}
              required
              value={values[field]}
            />
            <VacancyFieldError field={id} message={errors[field]} />
          </div>
        )
      })}
      {section === "conditions" && (
        <>
          <div className="vacancy-form-field">
            <Label htmlFor="vacancy-status">Estado</Label>
            <Select
              onValueChange={(value) => {
                if (typeof value === "string" && isVacancyStatus(value)) {
                  onChange("status", value)
                }
              }}
              value={values.status}
            >
              <SelectTrigger
                aria-describedby={
                  errors.status ? "vacancy-status-error" : undefined
                }
                aria-invalid={Boolean(errors.status)}
                className="vacancy-select-trigger"
                id="vacancy-status"
              >
                <SelectValue>{vacancyStatusLabels[values.status]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Estado</SelectLabel>
                  {vacancyStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {vacancyStatusLabels[status]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <VacancyFieldError field="vacancy-status" message={errors.status} />
          </div>
          <div className="vacancy-form-field">
            <Label htmlFor="vacancy-deadline">Fecha límite</Label>
            <Input
              aria-describedby={
                errors.deadline ? "vacancy-deadline-error" : undefined
              }
              aria-invalid={Boolean(errors.deadline)}
              id="vacancy-deadline"
              min={minimumDeadline}
              onBlur={onDeadlineBlur}
              onChange={(event) => onChange("deadline", event.target.value)}
              required
              type="date"
              value={values.deadline}
            />
            <VacancyFieldError
              field="vacancy-deadline"
              message={errors.deadline}
            />
          </div>
        </>
      )}
    </>
  )
}
