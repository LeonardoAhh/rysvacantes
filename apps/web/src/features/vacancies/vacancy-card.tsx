import { CalendarDays, MapPin, Pencil, Trash2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
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
        <p className="vacancy-area">{vacancy.area}</p>
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
        <span className={`vacancy-status vacancy-status-${vacancy.status}`}>
          {vacancyStatusLabels[vacancy.status]}
        </span>
        <span className="vacancy-deadline">
          <CalendarDays aria-hidden="true" />
          Límite: {formatDeadline(vacancy.deadline)}
        </span>
      </div>

      <div className="vacancy-card-actions">
        <Button
          aria-label={`Editar ${vacancy.title}`}
          disabled={!editingEnabled}
          onClick={() => onEdit(vacancy)}
          size="icon"
          variant="outline"
        >
          <Pencil aria-hidden="true" />
        </Button>
        <Button
          aria-label={`Eliminar ${vacancy.title}`}
          disabled={!editingEnabled}
          onClick={() => onDelete(vacancy)}
          size="icon"
          variant="destructive"
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
    </li>
  )
}
