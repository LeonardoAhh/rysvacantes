import { supabase } from "@/lib/supabase"
import { getBusinessDate } from "@/lib/business-date"
import { VacancyConflictError } from "./vacancy-conflict"
import { splitVacancyShiftFromTitle } from "./vacancy-shift"
import {
  hasCompleteVacancyDetails,
  type Vacancy,
  type VacancyFormValues,
  type VacancyStatus,
  type VacancySalaryPeriod,
} from "./vacancy-types"

export const vacancyPageSize = 12
let publicAreasCache: Promise<string[]> | null = null

const columns =
  "id,version,deleted_at,title,shift,area,location,modality,employment_type,description,education,experience,requirements,work_schedule,work_days,rest_days,salary,salary_period,benefits,status,deadline,created_at"

type VacancyRow = {
  id: string
  version: number
  deleted_at: string | null
  title: string
  shift: string
  area: string
  location: string
  modality: string
  employment_type: string
  description: string
  education: string
  experience: string
  requirements: string
  work_schedule: string
  work_days: string
  rest_days: string
  salary: string
  salary_period: VacancySalaryPeriod | null
  benefits: string
  status: VacancyStatus
  deadline: string
  created_at: string
}

type ListOptions = {
  scope: "public" | "editor"
  page: number
  search?: string
  area?: string
  status?: VacancyStatus
  archived?: boolean
  signal?: AbortSignal
  pageSize?: number
}

function client() {
  if (!supabase)
    throw new Error("La conexión con vacantes no está configurada.")
  return supabase
}

function dataError(code: string | undefined, action: string) {
  if (code === "40001" || code === "PGRST116") return new VacancyConflictError()
  if (code === "23514")
    return new Error(
      "Revisa el turno, el sueldo bruto y su período. La base de datos rechazó un valor inválido."
    )
  if (
    code === "PGRST205" ||
    code === "PGRST204" ||
    code === "42P01" ||
    code === "42703"
  ) {
    return new Error("La base de vacantes necesita las migraciones pendientes.")
  }
  if (code === "42501") {
    return new Error("Tu cuenta no tiene permiso para gestionar vacantes.")
  }
  return new Error(`No se pudieron ${action} las vacantes. Inténtalo de nuevo.`)
}

function fromRow(row: VacancyRow): Vacancy {
  return {
    id: row.id,
    version: row.version,
    deletedAt: row.deleted_at,
    title: row.title,
    shift: row.shift,
    area: row.area,
    location: row.location,
    modality: row.modality,
    employmentType: row.employment_type,
    description: row.description,
    education: row.education ?? "",
    experience: row.experience ?? "",
    requirements: row.requirements ?? "",
    workSchedule: row.work_schedule,
    workDays: row.work_days,
    restDays: row.rest_days,
    salary: row.salary,
    salaryPeriod: row.salary_period,
    benefits: row.benefits,
    status: row.status,
    deadline: row.deadline,
    isDemo: false,
  }
}

function toRow(values: VacancyFormValues) {
  return {
    title: values.title,
    shift: values.shift,
    area: values.area,
    location: values.location,
    modality: values.modality,
    employment_type: values.employmentType,
    description: values.description,
    education: values.education,
    experience: values.experience,
    requirements: values.requirements,
    work_schedule: values.workSchedule,
    work_days: values.workDays,
    rest_days: values.restDays,
    salary: values.salary,
    salary_period: values.salaryPeriod,
    benefits: values.benefits,
    status: values.status,
    deadline: values.deadline,
  }
}

function searchPattern(value: string) {
  const safe = value
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80)
  return safe ? `%${safe}%` : null
}

export async function listVacancies({
  scope,
  page,
  search,
  area,
  status,
  archived = false,
  signal,
  pageSize = vacancyPageSize,
}: ListOptions) {
  const limit = Math.max(1, Math.min(vacancyPageSize, pageSize))
  const start = Math.max(0, page) * limit
  let query = client()
    .from("vacancies")
    .select(columns, { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(start, start + limit - 1)

  if (scope === "public")
    query = query
      .eq("status", "published")
      .is("deleted_at", null)
      .gte("deadline", getBusinessDate())
  else
    query = archived
      ? query.not("deleted_at", "is", null)
      : query.is("deleted_at", null)
  if (status) query = query.eq("status", status)
  if (area && area !== "all") query = query.eq("area", area)

  const pattern = searchPattern(search ?? "")
  if (pattern) {
    query = query.or(
      ["title", "shift", "area", "location", "description"]
        .map((field) => `${field}.ilike.${pattern}`)
        .join(",")
    )
  }

  const { data, count, error } = await (signal
    ? query.abortSignal(signal)
    : query)
  if (error) throw dataError(error.code, "consultar")
  return {
    vacancies: ((data ?? []) as VacancyRow[]).map(fromRow),
    total: count ?? 0,
  }
}

export async function listPublicAreas() {
  let request = publicAreasCache

  if (!request) {
    request = Promise.resolve(
      client()
        .rpc("public_vacancy_areas")
        .then(({ data, error }) => {
          if (error) throw dataError(error.code, "consultar")
          return ((data ?? []) as { area: string }[]).map((row) => row.area)
        })
    ).catch((error: unknown) => {
      if (publicAreasCache === request) publicAreasCache = null
      throw error
    })
    publicAreasCache = request
  }

  return request
}

function invalidatePublicAreas() {
  publicAreasCache = null
}

export async function getVacancyCounts() {
  const { data, error } = await client().rpc("vacancy_counts")
  if (error) throw dataError(error.code, "consultar")
  const counts = (
    data as { total: number; published: number; draft: number }[] | null
  )?.[0]
  return counts ?? { total: 0, published: 0, draft: 0 }
}

export async function isVacancyEditor() {
  const { data, error } = await client().rpc("is_vacancy_editor")
  if (error) throw dataError(error.code, "verificar")
  return data === true
}

export async function createVacancy(
  values: VacancyFormValues,
  requestId: string = crypto.randomUUID()
) {
  const { data, error } = await client()
    .from("vacancies")
    .insert({ id: requestId, ...toRow(values) })
    .select(columns)
    .single()
  if (error?.code === "23505") {
    const previous = await client()
      .from("vacancies")
      .select(columns)
      .eq("id", requestId)
      .single()
    if (previous.error || !previous.data)
      throw dataError(previous.error?.code, "crear")
    const saved = previous.data as VacancyRow
    if (
      Object.entries(toRow(values)).some(
        ([key, value]) => saved[key as keyof VacancyRow] !== value
      )
    ) {
      throw new Error(
        "La vacante ya se guardó en un intento anterior con otros datos. Cierra el formulario y revisa la vacante en Gestión antes de editarla."
      )
    }
    invalidatePublicAreas()
    return fromRow(saved)
  }
  if (error || !data) throw dataError(error?.code, "crear")
  invalidatePublicAreas()
  return fromRow(data as VacancyRow)
}

export async function updateVacancy(
  id: string,
  version: number,
  values: VacancyFormValues
) {
  const { data, error } = await client()
    .from("vacancies")
    .update({ ...toRow(values), version: version + 1 })
    .eq("id", id)
    .eq("version", version)
    .is("deleted_at", null)
    .select(columns)
    .single()
  if (error || !data) throw dataError(error?.code, "actualizar")
  invalidatePublicAreas()
  return fromRow(data as VacancyRow)
}

export async function setVacancyArchived(
  id: string,
  version: number,
  archived: boolean
) {
  const { data, error } = await client()
    .from("vacancies")
    .update({
      deleted_at: archived ? new Date().toISOString() : null,
      version: version + 1,
    })
    .eq("id", id)
    .eq("version", version)
    .select("id")
    .single()
  if (error || !data)
    throw dataError(error?.code, archived ? "archivar" : "restaurar")
  invalidatePublicAreas()
}

export async function importLegacyVacancies(vacancies: readonly Vacancy[]) {
  const rows = vacancies.map((vacancy) => ({
    id: vacancy.id,
    ...toRow({
      ...vacancy,
      ...splitVacancyShiftFromTitle(vacancy.title, vacancy.shift),
      status:
        vacancy.status === "published" &&
        (!hasCompleteVacancyDetails(vacancy) ||
          !vacancy.shift.trim() ||
          !vacancy.salaryPeriod ||
          !/^\$[^$]*\d[^$]*$/.test(vacancy.salary))
          ? "draft"
          : vacancy.status,
    }),
  }))

  for (let start = 0; start < rows.length; start += 20) {
    const { error } = await client()
      .from("vacancies")
      .upsert(rows.slice(start, start + 20), {
        onConflict: "id",
        ignoreDuplicates: true,
      })
    if (error) throw dataError(error.code, "importar")
  }
  invalidatePublicAreas()
}
