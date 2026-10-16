export const routes = {
  home: "/",
  about: "/about",
  auth: "/auth",
  contact: "/contact",
  vacancies: "/vacancies",
  dashboard: "/dashboard",
} as const

export const publicSiteRoutes: readonly string[] = [
  routes.home,
  routes.about,
  routes.contact,
  routes.vacancies,
]
