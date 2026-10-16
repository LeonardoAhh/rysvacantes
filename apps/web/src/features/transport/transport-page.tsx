import { useMemo, useState } from "react"
import { ArrowUpRight, ChevronDown, Search } from "lucide-react"
import { PageBackground } from "@workspace/ui/components/page-background"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { LandingHeader } from "@/features/landing/landing-header"
import { routes } from "@/lib/routes"
import { cn } from "@/lib/utils"
import { transportRoutes, type TransportStop } from "./transport-routes"
import "@/features/landing/landing.css"
import "./transport.css"

const shifts = ["1.er turno", "2.º turno", "3.er turno"] as const

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-MX")
}

function StopItem({
  stop,
  index,
  shift,
}: {
  stop: TransportStop
  index: number
  shift: number | null
}) {
  return (
    <li className="transport-stop">
      <span aria-hidden="true" className="transport-stop-number">
        {index + 1}
      </span>
      <div className="transport-stop-info">
        <strong>{stop.area}</strong>
        <span>{stop.reference}</span>
      </div>
      <div
        className={cn(
          "transport-stop-times",
          shift !== null && "transport-stop-times-single"
        )}
      >
        {stop.times.map((time, timeIndex) =>
          shift === null || shift === timeIndex ? (
            <div className="transport-stop-time" key={timeIndex}>
              <span className="transport-stop-shift">{shifts[timeIndex]}</span>
              <span className={time ? "" : "transport-unavailable"}>
                {time ?? "Sin servicio"}
              </span>
            </div>
          ) : null
        )}
      </div>
    </li>
  )
}

export function TransportPage() {
  const [query, setQuery] = useState("")
  const [shift, setShift] = useState<number | null>(null)
  const normalizedQuery = normalizeSearch(query.trim())
  const matchingRoutes = useMemo(
    () =>
      transportRoutes
        .map((route) => ({
          ...route,
          visibleStops: route.stops
            .map((stop, index) => ({ stop, index }))
            .filter(
              ({ stop }) =>
                (!normalizedQuery ||
                  normalizeSearch(
                    `${route.name} ${stop.area} ${stop.reference}`
                  ).includes(normalizedQuery)) &&
                (shift === null || stop.times[shift] !== null)
            ),
        }))
        .filter((route) => route.visibleStops.length > 0),
    [normalizedQuery, shift]
  )

  return (
    <div className="site-page transport-page">
      <PageBackground />
      <a className="skip-link" href="#transport-content">
        Saltar al contenido
      </a>
      <LandingHeader currentPage="transport" />
      <main
        className="transport-main page-container"
        id="transport-content"
        tabIndex={-1}
      >
        <header className="transport-intro">
          <p className="transport-eyebrow">Trabaja en ViñoPlastic</p>
          <h1>Rutas de transporte</h1>
          <p>Consulta las paradas y horarios de cada ruta por turno.</p>
        </header>

        <section
          aria-label="Buscar rutas y paradas"
          className="transport-search-panel"
        >
          <label className="transport-search">
            <Search aria-hidden="true" />
            <span className="sr-only">
              Buscar por ruta, colonia o referencia
            </span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar parada"
              type="search"
              value={query}
            />
          </label>
          <div className="transport-shift-filter">
            <Select
              modal={false}
              onValueChange={(value) => {
                if (typeof value === "string") {
                  setShift(value === "all" ? null : Number(value))
                }
              }}
              value={shift === null ? "all" : String(shift)}
            >
              <SelectTrigger aria-label="Filtrar por turno">
                <SelectValue>
                  {shift === null ? "Todos" : shifts[shift]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="end" alignItemWithTrigger={false}>
                <SelectGroup>
                  <SelectLabel>Turnos</SelectLabel>
                  <SelectItem value="all">Todos los turnos</SelectItem>
                  {shifts.map((label, index) => (
                    <SelectItem key={label} value={String(index)}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </section>

        <div aria-live="polite" className="transport-result-count">
          {matchingRoutes.length}{" "}
          {matchingRoutes.length === 1 ? "ruta" : "rutas"} disponibles
        </div>
        <div className="transport-routes">
          {matchingRoutes.map((route) => (
            <details
              className="transport-route"
              open={Boolean(normalizedQuery || shift !== null)}
              id={route.id}
              key={`${route.id}-${normalizedQuery}-${shift}`}
            >
              <summary className="transport-route-heading">
                <span className="transport-route-id">
                  {route.id.toUpperCase()}
                </span>
                <div>
                  <h2 id={`${route.id}-title`}>{route.name}</h2>
                  <p>
                    {route.visibleStops.length}{" "}
                    {route.visibleStops.length === 1 ? "parada" : "paradas"}
                    {normalizedQuery || shift !== null ? " encontradas" : ""}
                  </p>
                </div>
                <ChevronDown
                  aria-hidden="true"
                  className="transport-route-chevron"
                />
              </summary>
              <ol className="transport-stops">
                {route.visibleStops.map(({ stop, index }) => (
                  <StopItem
                    index={index}
                    key={`${route.id}-${index}`}
                    shift={shift}
                    stop={stop}
                  />
                ))}
              </ol>
            </details>
          ))}
        </div>
        {matchingRoutes.length === 0 && (
          <p className="transport-empty">
            No encontramos paradas con esos filtros. Prueba con otra colonia o
            turno.
          </p>
        )}
        <aside className="transport-note">
          <p>
            Los horarios corresponden a las rutas actuales. Confirma con
            Reclutamiento cualquier duda sobre tu parada o turno.
          </p>
          <a href={routes.contact}>
            Contactar a Reclutamiento <ArrowUpRight aria-hidden="true" />
          </a>
        </aside>
      </main>
    </div>
  )
}
