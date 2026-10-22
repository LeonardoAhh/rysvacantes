import type { ComponentType } from "react"
import { routes } from "./routes"

type PageComponent = ComponentType
type RouteLoader = () => Promise<PageComponent>

const loaders: Record<string, RouteLoader> = {
  [routes.home]: () =>
    import("@/features/landing/landing-page").then(
      (module) => module.LandingPage
    ),
  [routes.about]: () =>
    import("@/features/about/about-page").then((module) => module.AboutPage),
  [routes.auth]: () =>
    import("@/features/auth/auth-page").then((module) => module.AuthPage),
  [routes.contact]: () =>
    import("@/features/contact/contact-page").then(
      (module) => module.ContactPage
    ),
  [routes.transport]: () =>
    import("@/features/transport/transport-page").then(
      (module) => module.TransportPage
    ),
  [routes.vacancies]: () =>
    import("@/features/vacancies/public-vacancies-page").then(
      (module) => module.PublicVacanciesPage
    ),
  [routes.dashboard]: () =>
    import("@/features/vacancies/dashboard-page").then(
      (module) => module.DashboardPage
    ),
  [routes.analytics]: () =>
    import("@/features/site-analytics/site-analytics-page").then(
      (module) => module.SiteAnalyticsPage
    ),
}

const cache = new Map<string, Promise<PageComponent>>()

export function normalizePath(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/"
}

export function loadRoute(pathname: string): Promise<PageComponent | null> {
  const path = normalizePath(pathname)
  const loader = loaders[path]
  if (!loader) return Promise.resolve(null)

  let loaded = cache.get(path)
  if (!loaded) {
    loaded = loader().catch((error: unknown) => {
      cache.delete(path)
      throw error
    })
    cache.set(path, loaded)
  }
  return loaded
}
