import { isVacancyStatus, type Vacancy } from "./vacancy-types"

type VacancyDetails = Pick<
  Vacancy,
  | "description"
  | "workSchedule"
  | "workDays"
  | "restDays"
  | "salary"
  | "benefits"
>

type StoredVacancy = Omit<Vacancy, keyof VacancyDetails> &
  Partial<VacancyDetails>

const storageKey = "vinoplastic.vacancies.v1"
const importedKey = "vinoplastic.vacancies.imported.v1"
const detailFields = [
  "description",
  "workSchedule",
  "workDays",
  "restDays",
  "salary",
  "benefits",
] as const satisfies readonly (keyof VacancyDetails)[]

function isStoredVacancy(value: unknown): value is StoredVacancy {
  if (typeof value !== "object" || value === null) return false
  const vacancy = value as Record<string, unknown>

  return (
    typeof vacancy.id === "string" &&
    vacancy.id.length > 0 &&
    typeof vacancy.title === "string" &&
    typeof vacancy.area === "string" &&
    typeof vacancy.location === "string" &&
    typeof vacancy.modality === "string" &&
    typeof vacancy.employmentType === "string" &&
    detailFields.every(
      (field) =>
        vacancy[field] === undefined || typeof vacancy[field] === "string"
    ) &&
    typeof vacancy.status === "string" &&
    isVacancyStatus(vacancy.status) &&
    typeof vacancy.deadline === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(vacancy.deadline) &&
    typeof vacancy.isDemo === "boolean"
  )
}

export function readLegacyVacancies(): {
  vacancies: Vacancy[]
  error: string | null
} {
  try {
    if (window.localStorage.getItem(importedKey) === "true") {
      return { vacancies: [], error: null }
    }

    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return { vacancies: [], error: null }

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.every(isStoredVacancy)) {
      return {
        vacancies: [],
        error: "No se pudo revisar el respaldo local. No se modificó.",
      }
    }

    return {
      vacancies: parsed
        .filter((vacancy) => !vacancy.isDemo)
        .map((vacancy) => ({
          ...vacancy,
          description: vacancy.description ?? "",
          workSchedule: vacancy.workSchedule ?? "",
          workDays: vacancy.workDays ?? "",
          restDays: vacancy.restDays ?? "",
          salary: vacancy.salary ?? "",
          benefits: vacancy.benefits ?? "",
        })),
      error: null,
    }
  } catch {
    return {
      vacancies: [],
      error: "No se pudo revisar el respaldo local. No se modificó.",
    }
  }
}

export function markLegacyVacanciesImported() {
  try {
    window.localStorage.setItem(importedKey, "true")
  } catch {
    // La importación conserva los ID originales y no sobrescribe registros existentes.
  }
}
