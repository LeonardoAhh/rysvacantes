import { useEffect, useState } from "react"
import { useAdminDataCache } from "@/features/auth/admin-data-cache"
import { listVacancies } from "./vacancy-repository"
import type { Vacancy, VacancyStatus } from "./vacancy-types"

type VacancyPageOptions = {
  scope: "public" | "editor"
  page: number
  search: string
  area?: string
  status?: VacancyStatus
  archived?: boolean
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
  archived = false,
  enabled = true,
  pageSize,
}: VacancyPageOptions) {
  const cache = useAdminDataCache()
  const [revision, setRevision] = useState(0)
  const cacheKey = `vacancies:page:${JSON.stringify([
    scope,
    page,
    search,
    area,
    status,
    archived,
    pageSize,
  ])}`
  const requestKey = JSON.stringify([
    scope,
    page,
    search,
    area,
    status,
    archived,
    revision,
    pageSize,
  ])
  const [state, setState] = useState<VacancyPageState>(() => {
    const cached = scope === "editor"
      ? cache?.get<Pick<VacancyPageState, "vacancies" | "total">>(cacheKey)
      : undefined
    return {
      key: cached ? requestKey : "",
      vacancies: cached?.vacancies ?? [],
      total: cached?.total ?? 0,
      loading: !cached,
      error: null,
    }
  })

  useEffect(() => {
    if (!enabled) return
    const cached = revision === 0 && scope === "editor"
      ? cache?.get<Pick<VacancyPageState, "vacancies" | "total">>(cacheKey)
      : undefined
    if (cached) return
    const controller = new AbortController()

    void listVacancies({
      scope,
      page,
      search,
      area,
      status,
      archived,
      signal: controller.signal,
      pageSize,
    })
      .then((result) => {
        if (!controller.signal.aborted) {
          if (scope === "editor") cache?.set(cacheKey, result)
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
    archived,
    enabled,
    revision,
    requestKey,
    pageSize,
    cache,
    cacheKey,
  ])

  const cached = revision === 0 && scope === "editor"
    ? cache?.get<Pick<VacancyPageState, "vacancies" | "total">>(cacheKey)
    : undefined
  const visibleState: VacancyPageState =
    state.key === requestKey || !cached
      ? state
      : { ...cached, key: requestKey, loading: false, error: null }

  return {
    ...visibleState,
    loading: visibleState.loading || visibleState.key !== requestKey,
    error: visibleState.key === requestKey ? visibleState.error : null,
    reload: () => {
      cache?.invalidate(cacheKey)
      setRevision((current) => current + 1)
    },
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
