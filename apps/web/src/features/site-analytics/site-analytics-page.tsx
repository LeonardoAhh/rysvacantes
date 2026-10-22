import { useCallback, useEffect, useRef, useState } from "react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { PageBackground } from "@workspace/ui/components/page-background"
import { SiteHeader } from "@/components/site-header"
import { DashboardAccess } from "@/features/auth/dashboard-access"
import { SignOutButton } from "@/features/auth/sign-out-button"
import { routes } from "@/lib/routes"
import {
  getSiteVisitSummary,
  type SiteVisitPeriod,
  type SiteVisitSummary,
} from "./site-analytics"
import { SiteAnalyticsChart } from "./site-analytics-chart"
import "./site-analytics-page.css"

const siteLaunchDate = "2026-10-17"
const launchDateLabel = new Intl.DateTimeFormat("es-MX", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date(`${siteLaunchDate}T00:00:00Z`))

function AnalyticsContent() {
  const [period, setPeriod] = useState<SiteVisitPeriod>("all")
  const [summaries, setSummaries] = useState<
    Partial<Record<SiteVisitPeriod, SiteVisitSummary>>
  >({})
  const summary = summaries[period] ?? null
  const [error, setError] = useState<{
    period: SiteVisitPeriod
    message: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const requestId = useRef(0)
  const currentError = error?.period === period ? error.message : null
  const pending = loading || (!summary && !currentError)

  const load = useCallback(async () => {
    const request = ++requestId.current
    setLoading(true)
    setError(null)
    try {
      const result = await getSiteVisitSummary(period)
      if (request === requestId.current)
        setSummaries((current) => ({ ...current, [period]: result }))
    } catch (cause) {
      if (request === requestId.current) {
        setError({
          period,
          message:
            cause instanceof Error
              ? cause.message
              : "No pudimos cargar las estadísticas.",
        })
      }
    } finally {
      if (request === requestId.current) setLoading(false)
    }
  }, [period])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => {
      requestId.current += 1
      window.clearTimeout(timer)
    }
  }, [load])

  return (
    <div className="site-analytics-page">
      <PageBackground />
      <a className="skip-link" href="#analytics-content">
        Saltar al contenido
      </a>
      <SiteHeader
        actionSlot={<SignOutButton />}
        breadcrumb={[
          { href: routes.home, label: "Inicio" },
          { href: routes.dashboard, label: "Gestión de vacantes" },
          { label: "Visitas al sitio" },
        ]}
        mobileBack
      />
      <main
        className="site-analytics-main page-container"
        id="analytics-content"
        tabIndex={-1}
      >
        <header className="site-analytics-intro">
          <p className="site-analytics-eyebrow">Panel de administración</p>
          <h1>Visitas al sitio</h1>
          <div className="site-analytics-intro-meta">
            <p className="site-analytics-description">
              Actividad diaria de las páginas públicas{" "}
              {period === "all"
                ? "desde el primer registro, incluido hoy."
                : `durante los últimos ${period} días, incluido hoy.`}
            </p>
            <Badge className="site-analytics-launch-badge" variant="secondary">
              Sitio publicado ·{" "}
              <time dateTime={siteLaunchDate}>{launchDateLabel}</time>
            </Badge>
          </div>
        </header>

        {pending && (
          <span className="sr-only" role="status">
            Cargando estadísticas
          </span>
        )}
        {currentError && (
          <div className="site-analytics-error" role="alert">
            <p>{currentError}</p>
            <Button onClick={() => void load()} size="sm" variant="outline">
              Reintentar
            </Button>
          </div>
        )}

        <SiteAnalyticsChart
          error={Boolean(currentError)}
          onPeriodChange={setPeriod}
          pending={pending}
          period={period}
          summary={summary}
        />
      </main>
    </div>
  )
}

export function SiteAnalyticsPage() {
  return (
    <DashboardAccess>
      <AnalyticsContent />
    </DashboardAccess>
  )
}
