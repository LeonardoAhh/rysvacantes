import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import type { VacancyFormValues } from "./vacancy-types"
import { VacancyBenefitsField } from "./vacancy-benefits-field"
import { VacancyFieldError } from "./vacancy-field-error"
import {
  vacancyTextFields,
  type VacancyFormErrors,
} from "./vacancy-form-validation"

type DetailField =
  | "description"
  | "workSchedule"
  | "workDays"
  | "restDays"
  | "salary"
  | "benefits"

type VacancyDetailsFieldsProps = {
  section: "work" | "compensation"
  values: VacancyFormValues
  onChange: (field: DetailField, value: string) => void
  onBlur: (field: DetailField) => void
  errors: VacancyFormErrors
}

export function VacancyDetailsFields({
  section,
  values,
  onChange,
  onBlur,
  errors,
}: VacancyDetailsFieldsProps) {
  return (
    <>
      {section === "work" && (
        <>
          <div className="vacancy-form-field vacancy-form-field-wide">
            <Label htmlFor="vacancy-description">Descripción</Label>
            <Textarea
              aria-describedby={
                errors.description ? "vacancy-description-error" : undefined
              }
              aria-invalid={Boolean(errors.description)}
              id="vacancy-description"
              maxLength={vacancyTextFields.description.maxLength}
              onBlur={() => onBlur("description")}
              onChange={(event) => onChange("description", event.target.value)}
              required
              rows={5}
              value={values.description}
            />
            <VacancyFieldError
              field="vacancy-description"
              message={errors.description}
            />
          </div>
          <div className="vacancy-form-field">
            <Label htmlFor="vacancy-work-schedule">Horario laboral</Label>
            <Input
              aria-describedby={
                errors.workSchedule ? "vacancy-work-schedule-error" : undefined
              }
              aria-invalid={Boolean(errors.workSchedule)}
              id="vacancy-work-schedule"
              maxLength={vacancyTextFields.workSchedule.maxLength}
              onBlur={() => onBlur("workSchedule")}
              onChange={(event) => onChange("workSchedule", event.target.value)}
              required
              value={values.workSchedule}
            />
            <VacancyFieldError
              field="vacancy-work-schedule"
              message={errors.workSchedule}
            />
          </div>
          <div className="vacancy-form-field">
            <Label htmlFor="vacancy-work-days">Días de trabajo</Label>
            <Input
              aria-describedby={
                errors.workDays ? "vacancy-work-days-error" : undefined
              }
              aria-invalid={Boolean(errors.workDays)}
              id="vacancy-work-days"
              maxLength={vacancyTextFields.workDays.maxLength}
              onBlur={() => onBlur("workDays")}
              onChange={(event) => onChange("workDays", event.target.value)}
              required
              value={values.workDays}
            />
            <VacancyFieldError
              field="vacancy-work-days"
              message={errors.workDays}
            />
          </div>
          <div className="vacancy-form-field">
            <Label htmlFor="vacancy-rest-days">Días de descanso</Label>
            <Input
              aria-describedby={
                errors.restDays ? "vacancy-rest-days-error" : undefined
              }
              aria-invalid={Boolean(errors.restDays)}
              id="vacancy-rest-days"
              maxLength={vacancyTextFields.restDays.maxLength}
              onBlur={() => onBlur("restDays")}
              onChange={(event) => onChange("restDays", event.target.value)}
              required
              value={values.restDays}
            />
            <VacancyFieldError
              field="vacancy-rest-days"
              message={errors.restDays}
            />
          </div>
        </>
      )}
      {section === "compensation" && (
        <>
          <div className="vacancy-form-field">
            <Label htmlFor="vacancy-salary">Sueldo</Label>
            <Input
              aria-describedby={
                errors.salary ? "vacancy-salary-error" : undefined
              }
              aria-invalid={Boolean(errors.salary)}
              id="vacancy-salary"
              maxLength={vacancyTextFields.salary.maxLength}
              onBlur={() => onBlur("salary")}
              onChange={(event) => onChange("salary", event.target.value)}
              required
              value={values.salary}
            />
            <VacancyFieldError field="vacancy-salary" message={errors.salary} />
          </div>
          <VacancyBenefitsField
            error={errors.benefits}
            onBlur={() => onBlur("benefits")}
            onChange={(value) => onChange("benefits", value)}
            value={values.benefits}
          />
        </>
      )}
    </>
  )
}
