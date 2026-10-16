import { routes } from "./routes"

export function syncPwaMetadata(path: string) {
  const isAdmin = path === routes.auth || path === routes.dashboard
  const manifestHref = isAdmin ? "/admin.webmanifest" : "/app.webmanifest"
  const faviconHref = isAdmin ? "/admin-icon.svg" : "/favicon.svg"
  const appleIconHref = isAdmin
    ? "/admin-apple-touch-icon.png"
    : "/apple-touch-icon.png"
  const appleTitle = isAdmin ? "Viño Admin" : "ViñoPlastic"

  const manifest = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')
  if (manifest && manifest.getAttribute("href") !== manifestHref) {
    manifest.href = manifestHref
  }

  const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (favicon && favicon.getAttribute("href") !== faviconHref) {
    favicon.href = faviconHref
  }

  const appleIcon = document.querySelector<HTMLLinkElement>(
    'link[rel="apple-touch-icon"]'
  )
  if (appleIcon && appleIcon.getAttribute("href") !== appleIconHref) {
    appleIcon.href = appleIconHref
  }

  const title = document.querySelector<HTMLMetaElement>(
    'meta[name="apple-mobile-web-app-title"]'
  )
  if (title) title.content = appleTitle
}
