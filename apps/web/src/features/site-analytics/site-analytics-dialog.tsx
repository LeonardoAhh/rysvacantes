import { useCallback, useEffect, useRef, useState } from "react"
import { BarChart3, RefreshCw } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { routes } from "@/lib/routes"
import {
  getSiteVisitSummary,
  type SiteVisitSummary,
  type SiteVisitPeriod,
} from "./site-analytics"
import { siteEventLabels } from "./site-events"
import "./site-analytics-dialog.css"

const pageLabels: Record<string, string> = {
  [routes.home]: "Inicio",
  [routes.about]: "Empresa",
  [routes.contact]: "Contacto",
  [routes.transport]: "Transporte",
  [routes.vacancies]: "Vacantes",
}
const numberFormat = new Intl.NumberFormat("es-MX")

export function SiteAnalyticsDialog({ onClose }: { onClose: () => void }) {
  const [period, setPeriod] = useState<SiteVisitPeriod>(7)
  const [loadedSummary, setLoadedSummary] = useState<{
    period: SiteVisitPeriod
    data: SiteVisitSummary
  } | null>(null)
  const summary = loadedSummary?.period === period ? loadedSummary.data : null
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const requestId = useRef(0)

  const load = useCallback(async () => {
    const request = ++requestId.current
    setLoading(true)
    setError(null)
    try {
      const result = await getSiteVisitSummary(period)
      if (request === requestId.current)
        setLoadedSummary({ period, data: result })
    } catch (cause) {
      if (request === requestId.current) {
        setError(
          cause instanceof Error
            ? cause.message
            : "No pudimos cargar las estadísticas."
        )
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

  const maxViews = Math.max(
    1,
    ...(summary?.pages.map((page) => page.views) ?? [])
  )

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      open
    >
      <DialogContent className="site-analytics-dialog">
        <DialogHeader className="site-analytics-heading">
          <span className="site-analytics-heading-icon">
            <BarChart3 aria-hidden="true" />
          </span>
          <DialogTitle>Visitas al sitio</DialogTitle>
          <DialogDescription>
            Actividad de las páginas públicas durante los últimos {period} días,
            incluido hoy.
          </DialogDescription>
        </DialogHeader>

        <div className="site-analytics-toolbar">
          <div
            aria-label="Periodo de estadísticas"
            className="site-analytics-period"
            role="group"
          >
            {([7, 30] as const).map((days) => (
              <Button
                aria-pressed={period === days}
                key={days}
                onClick={() => setPeriod(days)}
                type="button"
                variant="ghost"
              >
                {days} días
              </Button>
            ))}
          </div>
          <Button
            aria-label="Actualizar estadísticas"
            disabled={loading}
            onClick={() => void load()}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <RefreshCw aria-hidden="true" />
          </Button>
        </div>

        <section
          aria-label="Resumen de visitas"
          className="site-analytics-metrics"
        >
          {(
            [
              ["Vistas del periodo", summary?.totalViews],
              ["Visitantes aprox.", summary?.uniqueVisitors],
              ["Vistas hoy", summary?.todayViews],
            ] as const
          ).map(([label, value]) => (
            <div className="site-analytics-metric" key={label}>
              <span>{label}</span>
              <strong>
                {value === undefined ? "—" : numberFormat.format(value)}
              </strong>
            </div>
          ))}
        </section>

        <section
          aria-labelledby="site-analytics-pages-title"
          className="site-analytics-pages"
        >
          <div className="site-analytics-section-heading">
            <h3 id="site-analytics-pages-title">Vistas por página</h3>
          </div>
          {loading && !summary ? (
            <p className="site-analytics-status" role="status">
              Cargando visitas…
            </p>
          ) : error && !summary ? (
            <div className="site-analytics-error" role="alert">
              <p>{error}</p>
              <Button onClick={() => void load()} size="sm" variant="outline">
                Reintentar
              </Button>
            </div>
          ) : summary?.pages.length ? (
            <ul className="site-analytics-page-list">
              {summary.pages.map((page) => (
                <li key={page.path}>
                  <div className="site-analytics-page-copy">
                    <span>
                      {pageLabels[page.path] ?? page.path}
                      <small>
                        {numberFormat.format(page.visitors)}{" "}
                        {page.visitors === 1 ? "navegador" : "navegadores"}
                      </small>
                    </span>
                    <strong>{numberFormat.format(page.views)}</strong>
                  </div>
                  <div className="site-analytics-page-track">
                    <span
                      style={{ width: `${(page.views / maxViews) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="site-analytics-status">
              Todavía no hay visitas registradas.
            </p>
          )}
        </section>

        <section
          aria-labelledby="site-analytics-events-title"
          className="site-analytics-events"
        >
          <div className="site-analytics-section-heading">
            <h3 id="site-analytics-events-title">Interacciones</h3>
          </div>
          <p className="site-analytics-status">
            Son señales de interés; un clic a WhatsApp no confirma una
            conversación ni una solicitud.
          </p>
          <ul className="site-analytics-event-list" aria-busy={loading}>
            {Object.entries(siteEventLabels).map(([name, label]) => {
              const event = summary?.events.find((item) => item.name === name)
              const visitors = event?.visitors ?? 0
              return (
                <li key={name}>
                  <span>
                    {label}
                    <small>
                      {summary
                        ? `${numberFormat.format(visitors)} ${visitors === 1 ? "navegador" : "navegadores"}`
                        : "—"}
                    </small>
                  </span>
                  <strong>
                    {summary ? numberFormat.format(event?.clicks ?? 0) : "—"}
                  </strong>
                </li>
              )
            })}
          </ul>
        </section>

        {error && summary && (
          <p className="site-analytics-error-inline" role="alert">
            {error}
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
