import { useEffect, useState } from "react"
import { ArrowUpRight, BriefcaseBusiness, BusFront, Search } from "lucide-react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import { Input } from "@workspace/ui/components/input"
import { PageBackground } from "@workspace/ui/components/page-background"
import { Skeleton } from "@workspace/ui/components/skeleton"
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
import { routes, vacanciesListAnchorId } from "@/lib/routes"
import { listPublicAreas } from "./vacancy-repository"
import { useDebouncedValue, useVacancyPage } from "./use-vacancy-page"
import { useVacancyMasonry } from "./use-vacancy-masonry"
import { VacancyListSkeleton } from "./vacancy-list-skeleton"
import { VacancyPagination } from "./vacancy-pagination"
import { PublicVacancyCard } from "./public-vacancy-card"
import "./public-vacancies.css"

export function PublicVacanciesPage() {
  const [search, setSearch] = useState(
    () =>
      new URLSearchParams(window.location.search).get("search")?.slice(0, 80) ??
      ""
  )
  const [area, setArea] = useState("all")
  const [page, setPage] = useState(0)
  const [areas, setAreas] = useState<string[]>([])
  const [areasError, setAreasError] = useState<string | null>(null)
  const debouncedSearch = useDebouncedValue(search)
  const listing = useVacancyPage({
    scope: "public",
    page,
    search: debouncedSearch,
    area,
    enabled: search === debouncedSearch,
  })
  const loading = listing.loading || search !== debouncedSearch
  const showListSkeleton = loading && listing.vacancies.length === 0
  const masonryRef = useVacancyMasonry(
    listing.vacancies,
    !listing.error && listing.vacancies.length > 2
  )

  useEffect(() => {
    let active = true
    void listPublicAreas()
      .then((result) => active && setAreas(result))
      .catch(() => {
        if (active) setAreasError("No se pudieron cargar las áreas.")
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="public-vacancies-page">
      <PageBackground />
      <a className="skip-link" href="#vacancies-content">
        Saltar al contenido
      </a>
      <LandingHeader currentPage="vacancies" />

      <main
        className="public-vacancies-main page-container"
        id="vacancies-content"
        tabIndex={-1}
      >
        <header className="public-vacancies-intro">
          <p className="public-vacancies-eyebrow">Trabaja en ViñoPlastic</p>
          <h1>Vacantes disponibles</h1>
          <p className="public-vacancies-description">
            Revisa cada puesto y encuentra el que vaya contigo.
          </p>
          <a
            className="public-vacancies-transport-link"
            href={routes.transport}
          >
            <BusFront aria-hidden="true" />
            Consultar rutas de transporte
            <ArrowUpRight aria-hidden="true" />
          </a>
          <p className="public-vacancies-transport-note">
            Consulta las paradas y confirma con Reclutamiento la disponibilidad
            para tu turno.
          </p>
        </header>

        <section
          aria-labelledby={vacanciesListAnchorId}
          aria-busy={loading}
          className="public-vacancies-listing"
        >
          <div className="public-vacancies-toolbar">
            <div className="public-vacancies-results-heading">
              <h2 id={vacanciesListAnchorId}>Resultados</h2>
              <div aria-live="polite" className="public-vacancies-count">
                {showListSkeleton ? (
                  <Skeleton className="public-vacancies-count-skeleton" />
                ) : (
                  <>
                    {listing.total}{" "}
                    {listing.total === 1 ? "vacante" : "vacantes"}
                  </>
                )}
              </div>
            </div>
            <div className="public-vacancies-controls">
              <div className="public-vacancies-filters">
                <label
                  className="public-vacancies-search"
                  htmlFor="public-vacancies-search"
                >
                  <span className="sr-only">Buscar vacantes</span>
                  <Search aria-hidden="true" />
                  <Input
                    id="public-vacancies-search"
                    onChange={(event) => {
                      setSearch(event.target.value)
                      setPage(0)
                    }}
                    placeholder="Buscar vacantes"
                    type="search"
                    value={search}
                  />
                </label>
                <div className="public-vacancies-area-filter">
                  <Select
                    modal={false}
                    onValueChange={(value) => {
                      if (typeof value === "string") {
                        setArea(value)
                        setPage(0)
                      }
                    }}
                    value={area}
                  >
                    <SelectTrigger aria-label="Filtrar por área">
                      <SelectValue>
                        {area === "all" ? "Todas las áreas" : area}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent align="start" alignItemWithTrigger={false}>
                      <SelectGroup>
                        <SelectLabel>Áreas</SelectLabel>
                        <SelectItem value="all">Todas las áreas</SelectItem>
                        {areas.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {(listing.error || areasError) && (
            <Alert className="public-vacancies-error" variant="destructive">
              <AlertDescription>
                {listing.error || areasError}{" "}
                {listing.error && (
                  <Button
                    onClick={listing.reload}
                    size="sm"
                    type="button"
                    variant="link"
                  >
                    Reintentar
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          {showListSkeleton ? (
            <VacancyListSkeleton className="public-vacancies-grid" />
          ) : listing.error ? null : listing.vacancies.length > 0 ? (
            <ul className="public-vacancies-grid" inert={loading} ref={masonryRef}>
              {listing.vacancies.map((vacancy) => (
                <PublicVacancyCard key={vacancy.id} vacancy={vacancy} />
              ))}
            </ul>
          ) : (
            <Empty className="public-vacancies-empty">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BriefcaseBusiness aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>
                  {listing.total === 0 && !search && area === "all"
                    ? "No hay vacantes publicadas por ahora"
                    : "No encontramos vacantes con esos filtros"}
                </EmptyTitle>
                <EmptyDescription>
                  {listing.total === 0 && !search && area === "all"
                    ? "Vuelve pronto para consultar nuevas oportunidades."
                    : "Prueba con otra búsqueda o selecciona otra área."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
          {!showListSkeleton && !listing.error && (
            <VacancyPagination
              busy={loading}
              onPageChange={setPage}
              page={page}
              total={listing.total}
            />
          )}
        </section>
      </main>
    </div>
  )
}
