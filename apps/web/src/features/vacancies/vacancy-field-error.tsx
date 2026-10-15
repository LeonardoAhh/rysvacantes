import { FieldError } from "@workspace/ui/components/field"

type VacancyFieldErrorProps = {
  field: string
  message?: string
}

export function VacancyFieldError({ field, message }: VacancyFieldErrorProps) {
  return message ? (
    <FieldError id={`${field}-error`}>{message}</FieldError>
  ) : null
}
