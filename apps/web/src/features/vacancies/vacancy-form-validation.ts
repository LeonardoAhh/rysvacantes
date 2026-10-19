import {
  isMeaningfulVacancyDetail,
  isVacancySalaryPeriod,
  isVacancyStatus,
  type VacancyFormValues,
} from "./vacancy-types"
import {
  getVacancyBenefits,
  isValidSavingsRate,
  parseBenefitSelection,
  serializeBenefitSelection,
} from "./vacancy-benefits"
import { splitVacancyShiftFromTitle } from "./vacancy-shift"
import {
  formatVacancySalary,
  isVacancyOptionField,
  normalizeVacancyOption,
} from "./vacancy-options"

export const vacancyTextFields = {
  title: { label: "Puesto", maxLength: 100, capitalize: true },
  shift: { label: "Turno", maxLength: 40, capitalize: true },
  area: { label: "Área", maxLength: 80, capitalize: true },
  location: { label: "Ubicación", maxLength: 100, capitalize: true },
  modality: { label: "Modalidad", maxLength: 60, capitalize: true },
  employmentType: { label: "Tipo de empleo", maxLength: 60, capitalize: true },
  description: { label: "Descripción", maxLength: 2400, capitalize: true },
  education: { label: "Escolaridad", maxLength: 160, capitalize: true },
  experience: { label: "Experiencia", maxLength: 400, capitalize: true },
  requirements: {
    label: "Conocimientos y habilidades",
    maxLength: 1600,
    capitalize: true,
  },
  workSchedule: { label: "Horario laboral", maxLength: 120, capitalize: false },
  workDays: { label: "Días de trabajo", maxLength: 120, capitalize: true },
  restDays: { label: "Días de descanso", maxLength: 120, capitalize: true },
  salary: { label: "Sueldo bruto", maxLength: 120, capitalize: false },
  benefits: { label: "Prestaciones", maxLength: 1200, capitalize: true },
} as const

export type VacancyTextField = keyof typeof vacancyTextFields
export type VacancyFormErrors = Partial<Record<keyof VacancyFormValues, string>>

export const vacancyFieldOrder: (keyof VacancyFormValues)[] = [
  "title",
  "shift",
  "area",
  "location",
  "modality",
  "employmentType",
  "status",
  "deadline",
  "education",
  "experience",
  "requirements",
  "description",
  "workSchedule",
  "workDays",
  "restDays",
  "salary",
  "salaryPeriod",
  "benefits",
]

const detailFields = new Set<VacancyTextField>([
  "description",
  "workSchedule",
  "workDays",
  "restDays",
  "salary",
  "benefits",
])
const profileFields = new Set<VacancyTextField>([
  "education",
  "experience",
  "requirements",
])
const multilineFields = new Set<VacancyTextField>([
  "description",
  "requirements",
])
const unsupportedCharacters = /[\p{Cc}\p{Cf}\p{Extended_Pictographic}]/u
const meaningfulContent = /[\p{L}\p{N}]/u

export function normalizeVacancyField(field: VacancyTextField, value: string) {
  if (isVacancyOptionField(field)) return normalizeVacancyOption(field, value)
  if (field === "salary") return formatVacancySalary(value)
  if (field === "benefits") {
    const selection = parseBenefitSelection(value)
    return serializeBenefitSelection({
      ...selection,
      other: selection.other.map(capitalizeInitial),
    })
  }

  const multiline = multilineFields.has(field)
  const normalized = multiline
    ? value
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .map((line) => line.replace(/[\t ]+/g, " ").trim())
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    : value.replace(/\s+/g, " ").trim()

  return vacancyTextFields[field].capitalize
    ? capitalizeInitial(normalized)
    : normalized
}

function capitalizeInitial(normalized: string) {
  const firstWord = normalized.match(/^[^\p{L}]*(\p{L}[\p{L}\p{N}]*)/u)?.[1]
  if (firstWord && /\p{Lu}/u.test(firstWord.slice(1))) return normalized
  return normalized.replace(
    /^([^\p{L}]*)(\p{L})/u,
    (_, prefix: string, letter: string) =>
      prefix + letter.toLocaleUpperCase("es-MX")
  )
}

export function normalizeVacancyForm(
  values: VacancyFormValues
): VacancyFormValues {
  const normalized = { ...values }
  for (const field of Object.keys(vacancyTextFields) as VacancyTextField[]) {
    normalized[field] = normalizeVacancyField(field, values[field])
  }

  const position = splitVacancyShiftFromTitle(
    normalized.title,
    normalized.shift
  )
  normalized.title = position.title
  normalized.shift = position.shift

  return normalized
}

export function validateVacancyForm(
  values: VacancyFormValues,
  minimumDeadline: string
): VacancyFormErrors {
  const errors: VacancyFormErrors = {}

  for (const field of Object.keys(vacancyTextFields) as VacancyTextField[]) {
    const value = values[field]
    const { label, maxLength } = vacancyTextFields[field]
    if (profileFields.has(field) && !value.trim()) continue
    if (
      !value.trim() ||
      ((detailFields.has(field) ||
        profileFields.has(field) ||
        isVacancyOptionField(field)) &&
        !isMeaningfulVacancyDetail(
          field === "salary" ? value.replace(/^\$\s*/, "") : value
        ))
    ) {
      errors[field] = isVacancyOptionField(field)
        ? `Selecciona ${label.toLocaleLowerCase("es-MX")}.`
        : `Escribe ${label.toLocaleLowerCase("es-MX")} con información concreta.`
    } else if (value.length > maxLength) {
      errors[field] = `Usa como máximo ${maxLength} caracteres.`
    } else if (
      unsupportedCharacters.test(value.replace(/\n/g, "")) ||
      !meaningfulContent.test(value)
    ) {
      errors[field] =
        "Incluye letras o números y evita emojis o caracteres invisibles."
    }
  }

  if (
    !errors.benefits &&
    getVacancyBenefits(values.benefits).some(
      (benefit) => !isMeaningfulVacancyDetail(benefit)
    )
  ) {
    errors.benefits = "Cada prestación debe contener información concreta."
  }

  if (
    !errors.benefits &&
    !isValidSavingsRate(parseBenefitSelection(values.benefits).savingsRate)
  ) {
    errors.benefits =
      "El porcentaje del fondo de ahorro debe ser mayor que 0 y máximo 100."
  }

  if (!isVacancySalaryPeriod(values.salaryPeriod)) {
    errors.salaryPeriod = "Selecciona si el sueldo bruto es semanal o mensual."
  }

  if (!errors.salary && !/^\$[^$]*[0-9][^$]*$/.test(values.salary)) {
    errors.salary =
      "Escribe un sueldo bruto con importe y un solo signo $ al inicio."
  }

  if (!isVacancyStatus(values.status)) {
    errors.status = "Selecciona un estado válido."
  }

  const deadline = values.deadline
  const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(deadline)
    ? new Date(`${deadline}T00:00:00Z`)
    : null
  if (!deadline) {
    errors.deadline = "Selecciona una fecha límite."
  } else if (
    !parsedDate ||
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== deadline
  ) {
    errors.deadline = "Selecciona una fecha válida."
  } else if (deadline < minimumDeadline) {
    errors.deadline =
      "La fecha límite no puede ser anterior a la fecha permitida."
  }

  return errors
}
