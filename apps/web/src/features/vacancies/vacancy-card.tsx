import {
  Archive,
  CalendarDays,
  Ellipsis,
  MapPin,
  Pencil,
  RotateCcw,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { getBusinessDate } from "@/lib/business-date"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  hasCompleteVacancyDetails,
  vacancyStatusLabels,
  type Vacancy,
} from "./vacancy-types"

type VacancyCardProps = {
  vacancy: Vacancy
  editingEnabled: boolean
  onEdit: (vacancy: Vacancy) => void
  onDelete: (vacancy: Vacancy) => void
}

function formatDeadline(deadline: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(
    new Date(`${deadline}T00:00:00`)
  )
}

export function VacancyCard({
  vacancy,
  editingEnabled,
  onEdit,
  onDelete,
}: VacancyCardProps) {
  return (
    <li className="vacancy-card">
      <div className="vacancy-card-main">
        <div className="vacancy-card-title">
          <h3>{vacancy.title}</h3>
          {vacancy.isDemo && (
            <span className="vacancy-demo-badge">Ejemplo</span>
          )}
          {!hasCompleteVacancyDetails(vacancy) && (
            <span className="vacancy-incomplete-badge">Datos pendientes</span>
          )}
        </div>
        <div className="vacancy-card-context">
          <p className="vacancy-area">{vacancy.area}</p>
          {vacancy.shift.trim() && (
            <span className="vacancy-shift">{vacancy.shift}</span>
          )}
        </div>
        <div className="vacancy-card-meta">
          <span>
            <MapPin aria-hidden="true" />
            {vacancy.location}
          </span>
          <span>{vacancy.modality}</span>
          <span>{vacancy.employmentType}</span>
        </div>
      </div>

      <div className="vacancy-card-status">
        <span
          className={`vacancy-status vacancy-status-${vacancy.deletedAt || vacancy.deadline < getBusinessDate() ? "paused" : vacancy.status}`}
        >
          {vacancy.deletedAt
            ? "Archivada"
            : vacancy.status === "published" &&
                vacancy.deadline < getBusinessDate()
              ? "Vencida"
              : vacancyStatusLabels[vacancy.status]}
        </span>
        <span className="vacancy-deadline">
          <CalendarDays aria-hidden="true" />
          Límite: {formatDeadline(vacancy.deadline)}
        </span>
      </div>

      <div className="vacancy-card-actions">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                aria-label={`Acciones para ${vacancy.title}`}
                disabled={!editingEnabled}
                size="icon"
                variant="ghost"
              />
            }
          >
            <Ellipsis aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top">
            {!vacancy.deletedAt && (
              <DropdownMenuItem
                className="min-h-11"
                onClick={() => onEdit(vacancy)}
              >
                <Pencil aria-hidden="true" />
                Editar
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="min-h-11"
              onClick={() => onDelete(vacancy)}
              variant={vacancy.deletedAt ? "default" : "destructive"}
            >
              {vacancy.deletedAt ? (
                <RotateCcw aria-hidden="true" />
              ) : (
                <Archive aria-hidden="true" />
              )}
              {vacancy.deletedAt ? "Restaurar" : "Archivar"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  )
}
