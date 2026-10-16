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
import { getSiteVisitSummary, type SiteVisitSummary } from "./site-analytics"
import "./site-analytics-dialog.css"

const pageLabels: Record<string, string> = {
  [routes.home]: "Inicio",
  [routes.about]: "Empresa",
  [routes.contact]: "Contacto",
  [routes.vacancies]: "Vacantes",
}
const numberFormat = new Intl.NumberFormat("es-MX")

export function SiteAnalyticsDialog({ onClose }: { onClose: () => void }) {
  const [summary, setSummary] = useState<SiteVisitSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const requestId = useRef(0)

  const load = useCallback(async () => {
    const request = ++requestId.current
    setLoading(true)
    setError(null)
    try {
      const result = await getSiteVisitSummary()
      if (request === requestId.current) setSummary(result)
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
  }, [])

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
            Actividad de las páginas públicas desde que se activó el registro.
          </DialogDescription>
        </DialogHeader>

        <section
          aria-label="Resumen de visitas"
          className="site-analytics-metrics"
        >
          {(
            [
              ["Vistas totales", summary?.totalViews],
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
            <Button
              aria-label="Actualizar estadísticas"
              disabled={loading}
              onClick={() => void load()}
              size="icon-sm"
              variant="ghost"
            >
              <RefreshCw aria-hidden="true" />
            </Button>
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
                        {numberFormat.format(page.visitors)} navegadores
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

        {error && summary && (
          <p className="site-analytics-error-inline" role="alert">
            {error}
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
