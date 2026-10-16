import { routes } from "./routes"

const brand = "ViñoPlastic"

const pageTitles: Record<string, string> = {
  [routes.home]: `${brand} - Reclutamiento`,
  [routes.about]: `${brand} - Empresa`,
  [routes.auth]: `${brand} - Iniciar sesión`,
  [routes.contact]: `${brand} - Contacto`,
  [routes.transport]: `${brand} - Transporte`,
  [routes.vacancies]: `${brand} - Vacantes`,
  [routes.dashboard]: `${brand} - Panel de vacantes`,
}

export function getPageTitle(path: string, hasError = false) {
  if (hasError) return `${brand} - Error`
  return pageTitles[path] ?? `${brand} - Página no encontrada`
}
