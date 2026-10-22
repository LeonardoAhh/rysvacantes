export const routes = {
  home: "/",
  about: "/about",
  auth: "/auth",
  contact: "/contact",
  transport: "/transporte",
  vacancies: "/vacancies",
  dashboard: "/dashboard",
  analytics: "/analytics",
} as const

export const publicSiteRoutes: readonly string[] = [
  routes.home,
  routes.about,
  routes.contact,
  routes.transport,
  routes.vacancies,
]

export const vacanciesListAnchorId = "vacancies-list-title"
export const vacancyQueryParam = "vacancy"
export const authReturnQueryParam = "next"
