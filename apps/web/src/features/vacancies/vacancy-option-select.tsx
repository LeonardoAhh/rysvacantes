import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { vacancyOptions, type VacancyOptionField } from "./vacancy-options"
import { vacancyTextFields } from "./vacancy-form-validation"
import { getVacancyFieldId } from "./vacancy-form-steps"

export function VacancyOptionSelect({
  field,
  value,
  error,
  optional = false,
  describedBy,
  onChange,
  onBlur,
}: {
  field: VacancyOptionField
  value: string
  error?: string
  optional?: boolean
  describedBy?: string
  onChange: (value: string) => void
  onBlur: () => void
}) {
  const id = getVacancyFieldId(field)
  const options: readonly string[] = vacancyOptions[field]
  const hasLegacyValue = value !== "" && !options.includes(value)
  const description =
    [describedBy, error ? `${id}-error` : undefined]
      .filter(Boolean)
      .join(" ") || undefined
  return (
    <Select
      value={value || null}
      required={!optional}
      onValueChange={(next) => {
        if (typeof next === "string") onChange(next)
      }}
    >
      <SelectTrigger
        aria-describedby={description}
        aria-invalid={Boolean(error)}
        aria-required={!optional}
        className="vacancy-select-trigger"
        id={id}
        onBlur={onBlur}
      >
        <SelectValue>{value || "Selecciona una opción"}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{vacancyTextFields[field].label}</SelectLabel>
          {optional && <SelectItem value="">Sin especificar</SelectItem>}
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectGroup>
        {hasLegacyValue && (
          <SelectGroup>
            <SelectLabel>Valor guardado</SelectLabel>
            <SelectItem value={value}>{value}</SelectItem>
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  )
}
