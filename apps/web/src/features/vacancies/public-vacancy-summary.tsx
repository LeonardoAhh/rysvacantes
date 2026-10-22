import { MapPin } from "lucide-react"
import { vacancySalaryPeriodLabels, type Vacancy } from "./vacancy-types"

export function PublicVacancySummary({ vacancy }: { vacancy: Vacancy }) {
  return (
    <dl className="public-vacancy-details">
      <div>
        <dt>
          <MapPin aria-hidden="true" />
          Ubicación
        </dt>
        <dd>{vacancy.location}</dd>
      </div>
      <div>
        <dt>Modalidad</dt>
        <dd>{vacancy.modality}</dd>
      </div>
      <div className="public-vacancy-salary">
        <dt>Sueldo bruto</dt>
        <dd>
          {vacancy.salary.trim() || "Por definir"} ·{" "}
          {vacancy.salaryPeriod
            ? vacancySalaryPeriodLabels[vacancy.salaryPeriod]
            : "Período por definir"}
        </dd>
      </div>
    </dl>
  )
}
