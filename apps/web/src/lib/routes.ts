export const routes = {
  home: "/",
  about: "/about",
  auth: "/auth",
  contact: "/contact",
  transport: "/transporte",
  vacancies: "/vacancies",
  dashboard: "/dashboard",
} as const

export const publicSiteRoutes: readonly string[] = [
  routes.home,
  routes.about,
  routes.contact,
  routes.transport,
  routes.vacancies,
]
