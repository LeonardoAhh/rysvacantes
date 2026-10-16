import { useState } from "react"
import { ArrowRight, Check, MapPin } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { getPublicBenefits } from "./vacancy-benefits"
import { VacancyShiftBadge } from "./vacancy-shift-badge"
import {
  hasCompleteVacancyDetails,
  vacancySalaryPeriodLabels,
  type Vacancy,
} from "./vacancy-types"

type PublicVacancyCardProps = {
  vacancy: Vacancy
}

const cardSections = [
  "Resumen",
  "Descripción",
  "Jornada y prestaciones",
] as const

export function PublicVacancyCard({ vacancy }: PublicVacancyCardProps) {
  const [sectionIndex, setSectionIndex] = useState(0)
  const benefits = getPublicBenefits(vacancy.benefits)
  const nextLabel =
    sectionIndex === 0
      ? "Detalle"
      : sectionIndex === cardSections.length - 1
        ? "Volver"
        : "Siguiente"

  return (
    <li className="public-vacancy-item">
      <Card className="public-vacancy-card">
        <CardHeader className="public-vacancy-card-header">
          <div className="public-vacancy-topline">
            <div className="public-vacancy-tags">
              <Badge variant="secondary">{vacancy.area}</Badge>
              <VacancyShiftBadge
                className="public-vacancy-shift"
                shift={vacancy.shift}
              />
              {vacancy.isDemo && <Badge variant="outline">Ejemplo</Badge>}
              {!hasCompleteVacancyDetails(vacancy) && (
                <Badge variant="outline">Información pendiente</Badge>
              )}
            </div>
            <div className="public-vacancy-navigation">
              <Button
                aria-label={`${sectionIndex === cardSections.length - 1 ? "Volver al resumen" : nextLabel} de ${vacancy.title}. Sección ${sectionIndex + 1} de ${cardSections.length}: ${cardSections[sectionIndex]}`}
                className="public-vacancy-switch"
                onClick={() =>
                  setSectionIndex(
                    (current) => (current + 1) % cardSections.length
                  )
                }
                size="sm"
                type="button"
                variant="ghost"
              >
                {nextLabel}
                <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          </div>
          <CardTitle className="public-vacancy-title">
            <h2>{vacancy.title}</h2>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {sectionIndex === 0 && (
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
          )}
          {sectionIndex === 1 && (
            <section className="public-vacancy-description">
              <h3>Descripción</h3>
              <p>{vacancy.description.trim() || "Por definir"}</p>
            </section>
          )}
          {sectionIndex === 2 && (
            <>
              <dl className="public-vacancy-details">
                <div>
                  <dt>Horario laboral</dt>
                  <dd>{vacancy.workSchedule.trim() || "Por definir"}</dd>
                </div>
                <div>
                  <dt>Días de trabajo</dt>
                  <dd>{vacancy.workDays.trim() || "Por definir"}</dd>
                </div>
                <div>
                  <dt>Días de descanso</dt>
                  <dd>{vacancy.restDays.trim() || "Por definir"}</dd>
                </div>
              </dl>
              <section className="public-vacancy-benefits">
                <h3>Prestaciones</h3>
                {benefits.length > 0 ? (
                  <ul>
                    {benefits.map((benefit, index) => (
                      <li key={`${benefit}-${index}`}>
                        <Check aria-hidden="true" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Por definir</p>
                )}
              </section>
            </>
          )}
        </CardContent>
      </Card>
    </li>
  )
}
