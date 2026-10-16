import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import type { ComponentType, ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { PageBackground } from "@workspace/ui/components/page-background"
import {
  NavigationContext,
  type NavigateOptions,
} from "@/lib/navigation-context"
import { loadRoute, normalizePath } from "@/lib/route-loader"
import { getPageTitle } from "@/lib/page-title"
import { syncPwaMetadata } from "@/lib/pwa-metadata"
import { publicSiteRoutes, routes } from "@/lib/routes"
import "./App.css"

type ActiveRoute = {
  path: string
  Page: ComponentType
  scrollTo?: string | number
}

function RouteStatusPage({ children }: { children: ReactNode }) {
  return (
    <div className="route-status-page">
      <PageBackground />
      <main className="not-found-page page-container">{children}</main>
    </div>
  )
}

function NotFoundPage() {
  return (
    <RouteStatusPage>
      <p className="not-found-code">404</p>
      <h1>Página no encontrada</h1>
      <p>La dirección que buscas no existe.</p>
      <a href={routes.home}>Volver al inicio</a>
    </RouteStatusPage>
  )
}

function RouteErrorPage() {
  return (
    <RouteStatusPage>
      <h1>No pudimos abrir esta página</h1>
      <p>Vuelve a intentarlo en un momento.</p>
      <a href={routes.home}>Volver al inicio</a>
    </RouteStatusPage>
  )
}

function InitialRouteSkeleton() {
  return (
    <div
      aria-label="Preparando la página"
      className="route-skeleton"
      role="status"
    >
      <PageBackground />
      <div className="route-skeleton-header page-container">
        <Skeleton className="route-skeleton-brand" />
        <Skeleton className="route-skeleton-action" />
      </div>
      <div className="route-skeleton-content page-container">
        <Skeleton className="route-skeleton-eyebrow" />
        <Skeleton className="route-skeleton-title" />
        <Skeleton className="route-skeleton-copy" />
      </div>
    </div>
  )
}

function getInternalUrl(anchor: HTMLAnchorElement) {
  if (anchor.target && anchor.target !== "_self") return null
  if (anchor.hasAttribute("download")) return null

  const url = new URL(anchor.href, window.location.href)
  return url.origin === window.location.origin &&
    url.protocol === window.location.protocol
    ? url
    : null
}

function RouteView({ route }: { route: ActiveRoute }) {
  const reduceMotion = useReducedMotion()

  useLayoutEffect(() => {
    if (route.scrollTo === undefined) return
    let focusTarget: HTMLElement | null =
      document.querySelector("main h1") ?? document.querySelector("main")

    if (typeof route.scrollTo === "number") {
      window.scrollTo({ top: route.scrollTo, behavior: "instant" })
    } else if (route.scrollTo === "top") {
      window.scrollTo({ top: 0, behavior: "instant" })
    } else {
      const target = document.getElementById(
        decodeURIComponent(route.scrollTo.slice(1))
      )
      target?.scrollIntoView()
      if (target) {
        focusTarget = target.querySelector("h1, h2, h3") ?? target
      }
    }

    if (focusTarget) {
      if (!focusTarget.hasAttribute("tabindex")) focusTarget.tabIndex = -1
      focusTarget.focus({ preventScroll: true })
    }
  }, [route])

  return (
    <motion.div
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      initial={reduceMotion ? false : { opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
    >
      <route.Page />
    </motion.div>
  )
}

export function App() {
  const [activeRoute, setActiveRoute] = useState<ActiveRoute | null>(null)
  const requestId = useRef(0)
  const scrollPositions = useRef(new Map<string, number>())
  const currentUrl = useRef(window.location.href)

  useEffect(() => {
    if (activeRoute) {
      document.title = getPageTitle(
        activeRoute.path,
        activeRoute.Page === RouteErrorPage
      )
      syncPwaMetadata(activeRoute.path)
    }
  }, [activeRoute])

  useEffect(() => {
    if (!activeRoute) return
    const path = activeRoute.path
    if (!publicSiteRoutes.includes(path)) return

    void import("@/features/site-analytics/site-analytics")
      .then(({ recordPublicPageView }) => recordPublicPageView(path))
      .catch(() => undefined)
  }, [activeRoute])

  const showRoute = useCallback(
    async (pathname: string, scrollTo?: string | number) => {
      const path = normalizePath(pathname)
      const request = ++requestId.current

      try {
        const Page = (await loadRoute(path)) ?? NotFoundPage
        if (request === requestId.current)
          setActiveRoute({ path, Page, scrollTo })
      } catch {
        if (request === requestId.current) {
          setActiveRoute({ path, Page: RouteErrorPage, scrollTo })
        }
      }
    },
    []
  )

  const navigate = useCallback(
    (to: string, options?: NavigateOptions) => {
      const url = new URL(to, window.location.href)
      const path = normalizePath(url.pathname)
      const currentPath = normalizePath(window.location.pathname)

      if (path === currentPath && url.search === window.location.search) {
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }

      scrollPositions.current.set(currentUrl.current, window.scrollY)
      if (options?.replace) {
        window.history.replaceState({}, "", url)
      } else {
        window.history.pushState({}, "", url)
      }
      currentUrl.current = window.location.href
      void showRoute(path, url.hash || "top")
    },
    [showRoute]
  )

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = "manual"
    const initialPath = normalizePath(window.location.pathname)
    const initialRequest = ++requestId.current
    void loadRoute(initialPath)
      .then((Page) => {
        if (initialRequest === requestId.current) {
          setActiveRoute({ path: initialPath, Page: Page ?? NotFoundPage })
        }
      })
      .catch(() => {
        if (initialRequest === requestId.current) {
          setActiveRoute({ path: initialPath, Page: RouteErrorPage })
        }
      })

    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      )
        return

      const anchor = event.target.closest("a[href]")
      if (!(anchor instanceof HTMLAnchorElement)) return
      const url = getInternalUrl(anchor)
      if (!url) return

      const path = normalizePath(url.pathname)
      const currentPath = normalizePath(window.location.pathname)
      if (path === currentPath && url.hash) return

      event.preventDefault()
      navigate(url.href)
    }

    function onWarmRoute(event: Event) {
      if (!(event.target instanceof Element)) return
      const anchor = event.target.closest("a[href]")
      if (!(anchor instanceof HTMLAnchorElement)) return
      const url = getInternalUrl(anchor)
      if (url) void loadRoute(url.pathname).catch(() => undefined)
    }

    function onPopState() {
      scrollPositions.current.set(currentUrl.current, window.scrollY)
      currentUrl.current = window.location.href
      const savedPosition = scrollPositions.current.get(currentUrl.current)
      void showRoute(
        window.location.pathname,
        savedPosition ?? (window.location.hash || "top")
      )
    }

    document.addEventListener("click", onClick)
    document.addEventListener("pointerover", onWarmRoute)
    document.addEventListener("pointerdown", onWarmRoute)
    document.addEventListener("focusin", onWarmRoute)
    window.addEventListener("popstate", onPopState)
    return () => {
      window.history.scrollRestoration = previousRestoration
      document.removeEventListener("click", onClick)
      document.removeEventListener("pointerover", onWarmRoute)
      document.removeEventListener("pointerdown", onWarmRoute)
      document.removeEventListener("focusin", onWarmRoute)
      window.removeEventListener("popstate", onPopState)
    }
  }, [navigate, showRoute])

  return (
    <NavigationContext.Provider value={navigate}>
      <AnimatePresence initial={false} mode="wait">
        {activeRoute ? (
          <RouteView key={activeRoute.path} route={activeRoute} />
        ) : (
          <InitialRouteSkeleton key="initial" />
        )}
      </AnimatePresence>
    </NavigationContext.Provider>
  )
}
