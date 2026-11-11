import { useCallback, useEffect, useState } from "react"
import { BriefcaseBusiness, Plus, Search } from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { useAdminDataCache } from "@/features/auth/admin-data-cache"
import { Button } from "@workspace/ui/components/button"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import {
  isVacancyStatus,
  vacancyStatusLabels,
  vacancyStatuses,
  type Vacancy,
  type VacancyFormValues,
  type VacancyStatus,
} from "./vacancy-types"
import {
  createVacancy,
  setVacancyArchived,
  getVacancyCounts,
  updateVacancy,
} from "./vacancy-repository"
import { useDebouncedValue, useVacancyPage } from "./use-vacancy-page"
import { LegacyVacancyImport } from "./legacy-vacancy-import"
import { VacancyListSkeleton } from "./vacancy-list-skeleton"
import { VacancyPagination } from "./vacancy-pagination"
import { VacancyFormDialog } from "./vacancy-form-dialog"
import { VacancyCard } from "./vacancy-card"
import { VacancyConflictError } from "./vacancy-conflict"
import { DashboardIntro } from "./dashboard-intro"
import { routes } from "@/lib/routes"
import "./dashboard.css"

type StatusFilter = "all" | "archived" | VacancyStatus
type Counts = { total: number; published: number; draft: number }

function DashboardContent() {
  const cache = useAdminDataCache()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [page, setPage] = useState(0)
  const [counts, setCounts] = useState<Counts | null>(
    () => cache?.get<Counts>("vacancies:counts") ?? null
  )
  const [countsError, setCountsError] = useState<string | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null)
  const [vacancyToDelete, setVacancyToDelete] = useState<Vacancy | null>(null)
  const debouncedSearch = useDebouncedValue(search)
  const listing = useVacancyPage({
    scope: "editor",
    page,
    search: debouncedSearch,
    status:
      statusFilter === "all" || statusFilter === "archived"
        ? undefined
        : statusFilter,
    archived: statusFilter === "archived",
    enabled: search === debouncedSearch,
  })
  const loading = listing.loading || search !== debouncedSearch
  const editingEnabled = !busy && !listing.error

  const refreshCounts = useCallback(async () => {
    try {
      const result = await getVacancyCounts()
      cache?.set("vacancies:counts", result)
      setCounts(result)
      setCountsError(null)
    } catch (cause) {
      setCountsError(
        cause instanceof Error
          ? cause.message
          : "No se pudo consultar el resumen."
      )
    }
  }, [cache])

  useEffect(() => {
    if (cache?.get<Counts>("vacancies:counts")) return
    const timer = window.setTimeout(() => void refreshCounts(), 0)
    return () => window.clearTimeout(timer)
  }, [cache, refreshCounts])

  function refreshData() {
    cache?.invalidate("vacancies:")
    listing.reload()
    void refreshCounts()
  }

  async function handleSave(values: VacancyFormValues, requestId: string) {
    setBusy(true)
    setMutationError(null)
    try {
      if (selectedVacancy)
        await updateVacancy(selectedVacancy.id, selectedVacancy.version, values)
      else await createVacancy(values, requestId)
      setFormOpen(false)
      setPage(0)
      refreshData()
    } catch (error) {
      if (error instanceof VacancyConflictError) refreshData()
      throw error
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!vacancyToDelete || busy) return
    setBusy(true)
    setMutationError(null)
    try {
      await setVacancyArchived(
        vacancyToDelete.id,
        vacancyToDelete.version,
        !vacancyToDelete.deletedAt
      )
      setVacancyToDelete(null)
      cache?.invalidate("vacancies:")
      if (page > 0 && listing.vacancies.length === 1) setPage(page - 1)
      else listing.reload()
      void refreshCounts()
    } catch (cause) {
      if (cause instanceof VacancyConflictError) refreshData()
      setMutationError(
        cause instanceof Error
          ? cause.message
          : "No se pudo archivar o restaurar la vacante."
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="dashboard-page">
      <PageBackground />
      <a className="skip-link" href="#dashboard-content">
        Saltar al contenido
      </a>
      <div className="admin-layout">
        <AdminSidebar activePath={routes.dashboard} />
        <main
          className="dashboard-content admin-content page-container"
          id="dashboard-content"
          tabIndex={-1}
        >
          <DashboardIntro
            editingEnabled={editingEnabled}
            onCreate={() => {
              setSelectedVacancy(null)
              setFormOpen(true)
            }}
          />

          <section
            aria-label="Resumen de vacantes"
            className="dashboard-summary"
          >
            {(
              [
                ["total", "Total de vacantes", ""],
                ["published", "Publicadas", "dashboard-summary-icon-active"],
                ["draft", "Borradores", "dashboard-summary-icon-draft"],
              ] as const
            ).map(([key, label, iconClass]) => (
              <div className="dashboard-summary-card" key={key}>
                <div className="dashboard-summary-label">
                  <span className={`dashboard-summary-icon ${iconClass}`}>
                    <BriefcaseBusiness aria-hidden="true" />
                  </span>
                  <p>{label}</p>
                </div>
                {counts ? (
                  <strong>{counts[key]}</strong>
                ) : (
                  <Skeleton className="dashboard-summary-skeleton" />
                )}
              </div>
            ))}
          </section>
          {countsError && (
            <p className="dashboard-storage-error" role="alert">
              {countsError}{" "}
              <Button
                onClick={() => void refreshCounts()}
                size="sm"
                variant="link"
              >
                Reintentar
              </Button>
            </p>
          )}
          <LegacyVacancyImport onImported={refreshData} />

          <section
            aria-busy={loading}
            aria-label="Listado de vacantes"
            className="dashboard-listing"
          >
            <div className="dashboard-listing-heading">
              <div className="dashboard-listing-title">
                <h2>Vacantes</h2>
                <div aria-live="polite" className="dashboard-listing-count">
                  {loading && listing.vacancies.length === 0 ? (
                    <Skeleton className="dashboard-count-skeleton" />
                  ) : (
                    `${listing.total} ${listing.total === 1 ? "resultado" : "resultados"}`
                  )}
                </div>
              </div>
              <div className="dashboard-filters">
                <label className="dashboard-search">
                  <Search aria-hidden="true" />
                  <span className="sr-only">Buscar vacante</span>
                  <Input
                    onChange={(event) => {
                      setSearch(event.target.value)
                      setPage(0)
                    }}
                    placeholder="Buscar"
                    type="search"
                    value={search}
                  />
                </label>
                <div className="dashboard-status-filter">
                  <Select
                    modal={false}
                    onValueChange={(value) => {
                      if (
                        typeof value === "string" &&
                        (value === "all" ||
                          value === "archived" ||
                          isVacancyStatus(value))
                      ) {
                        setStatusFilter(value)
                        setPage(0)
                      }
                    }}
                    value={statusFilter}
                  >
                    <SelectTrigger aria-label="Filtrar por estado">
                      <SelectValue>
                        {statusFilter === "all"
                          ? "Todos"
                          : statusFilter === "archived"
                            ? "Archivadas"
                            : vacancyStatusLabels[statusFilter]}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Estados</SelectLabel>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="archived">Archivadas</SelectItem>
                        {vacancyStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {vacancyStatusLabels[status]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {(listing.error || mutationError) && (
              <p className="dashboard-storage-error" role="alert">
                {listing.error ?? mutationError}{" "}
                {listing.error && (
                  <Button onClick={listing.reload} size="sm" variant="link">
                    Reintentar
                  </Button>
                )}
              </p>
            )}
            {loading && listing.vacancies.length === 0 ? (
              <VacancyListSkeleton className="vacancy-list" />
            ) : listing.error ? null : listing.vacancies.length > 0 ? (
              <>
                <ul className="vacancy-list" inert={loading}>
                  {listing.vacancies.map((vacancy) => (
                    <VacancyCard
                      editingEnabled={editingEnabled}
                      key={vacancy.id}
                      onDelete={setVacancyToDelete}
                      onEdit={(item) => {
                        setSelectedVacancy(item)
                        setFormOpen(true)
                      }}
                      vacancy={vacancy}
                    />
                  ))}
                </ul>
                <VacancyPagination
                  busy={loading}
                  onPageChange={setPage}
                  page={page}
                  total={listing.total}
                />
              </>
            ) : (
              <div className="dashboard-empty-state">
                <BriefcaseBusiness aria-hidden="true" />
                <h3>
                  {counts?.total === 0
                    ? "Aún no hay vacantes"
                    : "No encontramos vacantes"}
                </h3>
                <p>
                  {counts?.total === 0
                    ? "Crea una vacante para empezar a organizar tus oportunidades."
                    : "Prueba con otra búsqueda o cambia el filtro de estado."}
                </p>
                {counts?.total === 0 && (
                  <Button
                    disabled={!editingEnabled}
                    onClick={() => {
                      setSelectedVacancy(null)
                      setFormOpen(true)
                    }}
                    variant="outline"
                  >
                    <Plus aria-hidden="true" />
                    Crear vacante
                  </Button>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
      {formOpen && (
        <VacancyFormDialog
          key={selectedVacancy?.id ?? "new-vacancy"}
          onClose={() => setFormOpen(false)}
          onSave={handleSave}
          vacancy={selectedVacancy}
        />
      )}
      <AlertDialog
        onOpenChange={(open) => {
          if (!open && !busy) setVacancyToDelete(null)
        }}
        open={vacancyToDelete !== null}
      >
        <AlertDialogContent className="vacancy-delete-dialog-content">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {vacancyToDelete?.deletedAt
                ? "¿Restaurar esta vacante?"
                : "¿Archivar esta vacante?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {vacancyToDelete
                ? vacancyToDelete.deletedAt
                  ? `“${vacancyToDelete.title}” volverá a Gestión. Solo aparecerá públicamente si está publicada y vigente.`
                  : `“${vacancyToDelete.title}” dejará de mostrarse. Puedes recuperarla desde el filtro Archivadas.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={!editingEnabled}
              onClick={() => void handleDelete()}
              variant={vacancyToDelete?.deletedAt ? "default" : "destructive"}
            >
              {vacancyToDelete?.deletedAt
                ? "Restaurar vacante"
                : "Archivar vacante"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function DashboardPage() {
  return <DashboardContent />
}
