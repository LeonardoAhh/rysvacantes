import { useEffect, useState } from "react"
import { listVacancies } from "./vacancy-repository"
import type { Vacancy, VacancyStatus } from "./vacancy-types"

type VacancyPageOptions = {
  scope: "public" | "editor"
  page: number
  search: string
  area?: string
  status?: VacancyStatus
  enabled?: boolean
  pageSize?: number
}

type VacancyPageState = {
  key: string
  vacancies: Vacancy[]
  total: number
  loading: boolean
  error: string | null
}

export function useVacancyPage({
  scope,
  page,
  search,
  area,
  status,
  enabled = true,
  pageSize,
}: VacancyPageOptions) {
  const [state, setState] = useState<VacancyPageState>({
    key: "",
    vacancies: [],
    total: 0,
    loading: true,
    error: null,
  })
  const [revision, setRevision] = useState(0)
  const requestKey = JSON.stringify([
    scope,
    page,
    search,
    area,
    status,
    revision,
    pageSize,
  ])

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()

    void listVacancies({
      scope,
      page,
      search,
      area,
      status,
      signal: controller.signal,
      pageSize,
    })
      .then((result) => {
        if (!controller.signal.aborted) {
          setState({ ...result, key: requestKey, loading: false, error: null })
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState({
            key: requestKey,
            vacancies: [],
            total: 0,
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "No se pudieron consultar las vacantes.",
          })
        }
      })

    return () => controller.abort()
  }, [
    scope,
    page,
    search,
    area,
    status,
    enabled,
    revision,
    requestKey,
    pageSize,
  ])

  return {
    ...state,
    loading: state.loading || state.key !== requestKey,
    error: state.key === requestKey ? state.error : null,
    reload: () => setRevision((current) => current + 1),
  }
}

export function useDebouncedValue(value: string, delay = 350) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debounced
}
