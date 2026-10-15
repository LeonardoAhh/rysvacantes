export const vacancyStatuses = [
  "draft",
  "published",
  "paused",
  "filled",
] as const

export type VacancyStatus = (typeof vacancyStatuses)[number]

export type Vacancy = Readonly<{
  id: string
  title: string
  area: string
  location: string
  modality: string
  employmentType: string
  description: string
  workSchedule: string
  workDays: string
  restDays: string
  salary: string
  benefits: string
  status: VacancyStatus
  deadline: string
  isDemo: boolean
}>

export type VacancyFormValues = Omit<Vacancy, "id" | "isDemo">

export function isMeaningfulVacancyDetail(value: string): boolean {
  const normalized = value.trim().toLocaleLowerCase("es")
  return normalized !== "" && normalized !== "por definir"
}

export function hasCompleteVacancyDetails(vacancy: Vacancy): boolean {
  return [
    vacancy.description,
    vacancy.workSchedule,
    vacancy.workDays,
    vacancy.restDays,
    vacancy.salary,
    vacancy.benefits,
  ].every(isMeaningfulVacancyDetail)
}

export const vacancyStatusLabels: Record<VacancyStatus, string> = {
  draft: "Borrador",
  published: "Publicada",
  paused: "Pausada",
  filled: "Cubierta",
}

export function isVacancyStatus(value: string): value is VacancyStatus {
  return vacancyStatuses.some((status) => status === value)
}
