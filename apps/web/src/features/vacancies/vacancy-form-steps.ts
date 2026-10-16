import type { VacancyFormValues } from "./vacancy-types"

export const vacancyFormSteps = [
  {
    title: "Puesto y ubicación",
    fields: ["title", "shift", "area", "location"],
  },
  {
    title: "Condiciones",
    fields: ["modality", "employmentType", "status", "deadline"],
  },
  {
    title: "Descripción y jornada",
    fields: ["description", "workSchedule", "workDays", "restDays"],
  },
  {
    title: "Sueldo y prestaciones",
    fields: ["salary", "salaryPeriod", "benefits"],
  },
] as const satisfies readonly {
  title: string
  fields: readonly (keyof VacancyFormValues)[]
}[]

export type VacancyFormStep = 0 | 1 | 2 | 3

export function getVacancyFieldId(field: keyof VacancyFormValues) {
  return `vacancy-${field.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`
}

export function getFieldStep(field: keyof VacancyFormValues): VacancyFormStep {
  const index = vacancyFormSteps.findIndex((step) =>
    (step.fields as readonly (keyof VacancyFormValues)[]).includes(field)
  )
  return index as VacancyFormStep
}
