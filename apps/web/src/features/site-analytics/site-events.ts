import { publicSiteRoutes, routes } from "@/lib/routes"

export const siteEventLabels = {
  home_vacancies: "De Inicio a Vacantes",
  vacancy_detail: "Detalles de vacantes",
  contact_click: "Accesos a Contacto",
  transport_click: "Consultas de transporte",
  whatsapp_click: "Clics a WhatsApp",
} as const
export type SiteEventName = keyof typeof siteEventLabels

export function getPublicInteraction(event: MouseEvent): {
  name: SiteEventName
  path: string
} | null {
  const path = window.location.pathname.replace(/\/+$/, "") || "/"
  if (!publicSiteRoutes.includes(path) || !(event.target instanceof Element))
    return null
  const target = event.target.closest<HTMLElement>("a[href], [data-site-event]")
  if (!target) return null
  const name = target.dataset.siteEvent
  if (name && Object.hasOwn(siteEventLabels, name)) {
    return { name: name as SiteEventName, path }
  }
  if (!(target instanceof HTMLAnchorElement)) return null
  const url = new URL(target.href, window.location.href)
  if (url.protocol === "https:" && url.hostname === "wa.me")
    return { name: "whatsapp_click", path }
  if (url.origin !== window.location.origin) return null
  const destination = url.pathname.replace(/\/+$/, "") || "/"
  if (destination === path) return null
  if (destination === routes.contact) return { name: "contact_click", path }
  if (destination === routes.transport) return { name: "transport_click", path }
  if (path === routes.home && destination === routes.vacancies)
    return { name: "home_vacancies", path }
  return null
}
