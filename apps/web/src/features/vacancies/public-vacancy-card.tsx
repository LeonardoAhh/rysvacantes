import { useState } from "react"
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  MapPin,
} from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { routes } from "@/lib/routes"
import { getPublicBenefits } from "./vacancy-benefits"
import { hasCompleteVacancyDetails, type Vacancy } from "./vacancy-types"

type PublicVacancyCardProps = {
  vacancy: Vacancy
}

const cardSections = [
  "Resumen",
  "Descripción",
  "Jornada y prestaciones",
] as const

function formatDeadline(deadline: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "long" }).format(
    new Date(`${deadline}T00:00:00`)
  )
}

export function PublicVacancyCard({ vacancy }: PublicVacancyCardProps) {
  const [sectionIndex, setSectionIndex] = useState(0)
  const benefits = getPublicBenefits(vacancy.benefits)
  const nextLabel =
    sectionIndex === 0
      ? "Ver más"
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
              {vacancy.isDemo && <Badge variant="outline">Ejemplo</Badge>}
              {!hasCompleteVacancyDetails(vacancy) && (
                <Badge variant="outline">Información pendiente</Badge>
              )}
            </div>
            <div className="public-vacancy-navigation">
              <span
                aria-label={`Sección ${sectionIndex + 1} de ${cardSections.length}: ${cardSections[sectionIndex]}`}
                aria-live="polite"
                className="public-vacancy-section-count"
              >
                {sectionIndex + 1} de {cardSections.length}
              </span>
              <Button
                aria-label={`${sectionIndex === cardSections.length - 1 ? "Volver al resumen" : nextLabel} de ${vacancy.title}. Vista ${sectionIndex + 1} de ${cardSections.length}`}
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
          <CardTitle>
            <h2>{vacancy.title}</h2>
          </CardTitle>
          <CardDescription>{vacancy.employmentType}</CardDescription>
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
                <dt>Sueldo</dt>
                <dd>{vacancy.salary.trim() || "Por definir"}</dd>
              </div>
              <div>
                <dt>
                  <CalendarDays aria-hidden="true" />
                  Fecha límite
                </dt>
                <dd>
                  <time dateTime={vacancy.deadline}>
                    {formatDeadline(vacancy.deadline)}
                  </time>
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

        {sectionIndex === cardSections.length - 1 && (
          <CardFooter className="public-vacancy-card-footer">
            <a
              className={`${buttonVariants({ variant: "outline" })} public-vacancy-action`}
              href={routes.contact}
            >
              Pedir información
              <ArrowUpRight aria-hidden="true" />
            </a>
          </CardFooter>
        )}
      </Card>
    </li>
  )
}
