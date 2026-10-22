import { useLayoutEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { getVacancyWhatsAppUrl } from "@/lib/recruitment-contact"
import { vacancyQueryParam } from "@/lib/routes"
import { getPublicBenefits } from "./vacancy-benefits"
import { PublicVacancySummary } from "./public-vacancy-summary"
import {
  isMeaningfulVacancyDetail,
  vacancySalaryPeriodLabels,
  type Vacancy,
} from "./vacancy-types"
import "./public-vacancy-details-dialog.css"

type VacancyStep = "description" | "summary" | "requirements" | "schedule"

const stepLabels: Record<VacancyStep, string> = {
  description: "Puesto",
  summary: "Resumen",
  requirements: "Requisitos",
  schedule: "Jornada",
}

export function PublicVacancyDetailsDialog({ vacancy }: { vacancy: Vacancy }) {
  const scrollbarWidth = useRef(
    Math.max(0, window.innerWidth - document.documentElement.clientWidth)
  )
  const [open, setOpen] = useState(
    () =>
      new URLSearchParams(window.location.search).get(vacancyQueryParam) ===
      vacancy.id
  )
  const [stepIndex, setStepIndex] = useState(0)
  const benefits = getPublicBenefits(vacancy.benefits)
  const requirements = vacancy.requirements
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(isMeaningfulVacancyDetail)
  const hasRequirements = [
    vacancy.education,
    vacancy.experience,
    vacancy.requirements,
  ].some(isMeaningfulVacancyDetail)
  const steps: VacancyStep[] = hasRequirements
    ? ["description", "summary", "requirements", "schedule"]
    : ["description", "summary", "schedule"]
  const activeStep = steps[stepIndex] ?? "description"

  useLayoutEffect(() => {
    if (open) {
      document.documentElement.style.setProperty(
        "--vacancy-sheet-scrollbar-width",
        `${scrollbarWidth.current}px`
      )
    }
  }, [open])

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      scrollbarWidth.current = Math.max(
        0,
        window.innerWidth - document.documentElement.clientWidth
      )
    }
    setOpen(nextOpen)
    if (!nextOpen) setStepIndex(0)
  }

  return (
    <Sheet
      onOpenChange={handleOpenChange}
      onOpenChangeComplete={(nextOpen) => {
        if (!nextOpen) {
          document.documentElement.style.removeProperty(
            "--vacancy-sheet-scrollbar-width"
          )
        }
      }}
      open={open}
    >
      <SheetTrigger
        render={
          <Button
            className="public-vacancy-details-trigger"
            data-site-event="vacancy_detail"
            type="button"
          />
        }
      >
        Ver todos los detalles <ArrowRight aria-hidden="true" />
      </SheetTrigger>
      <SheetContent
        className="public-vacancy-sheet"
        showCloseButton={false}
        side="bottom"
      >
        <SheetHeader className="public-vacancy-sheet-header">
          <div className="public-vacancy-sheet-heading">
            <div className="public-vacancy-sheet-heading-copy">
              <p>Vacante · {vacancy.area}</p>
              <SheetTitle>{vacancy.title}</SheetTitle>
              <span>
                Sueldo bruto: {vacancy.salary.trim() || "Por definir"} ·{" "}
                {vacancy.salaryPeriod
                  ? vacancySalaryPeriodLabels[vacancy.salaryPeriod]
                  : "Período por definir"}
              </span>
            </div>
            <Button
              aria-label="Cerrar detalles de la vacante"
              onClick={() => handleOpenChange(false)}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <X aria-hidden="true" />
            </Button>
          </div>
          <div className="public-vacancy-step-heading">
            <span>Paso {stepIndex + 1} de {steps.length}</span>
            <strong>{stepLabels[activeStep]}</strong>
          </div>
          <ol aria-label="Pasos de los detalles" className="public-vacancy-steps">
            {steps.map((step, index) => (
              <li key={step}>
                <button
                  aria-current={index === stepIndex ? "step" : undefined}
                  aria-label={`Paso ${index + 1} de ${steps.length}: ${stepLabels[step]}`}
                  className={index === stepIndex ? "is-current" : undefined}
                  onClick={() => setStepIndex(index)}
                  type="button"
                >
                  {index < stepIndex ? <Check aria-hidden="true" /> : index + 1}
                </button>
              </li>
            ))}
          </ol>
        </SheetHeader>

        <div className="public-vacancy-sheet-body" key={activeStep}>
          {activeStep === "description" && (
            <section className="public-vacancy-description">
              <h3>Descripción del puesto</h3>
              <p>{vacancy.description.trim() || "Por definir"}</p>
            </section>
          )}
          {activeStep === "summary" && (
            <section>
              <h3>Resumen de la vacante</h3>
              <PublicVacancySummary vacancy={vacancy} />
            </section>
          )}
          {activeStep === "requirements" && (
            <section className="public-vacancy-requirements">
              <h3>Requisitos</h3>
              <dl className="public-vacancy-details">
                {isMeaningfulVacancyDetail(vacancy.education) && (
                  <div>
                    <dt>Escolaridad</dt>
                    <dd>{vacancy.education}</dd>
                  </div>
                )}
                {isMeaningfulVacancyDetail(vacancy.experience) && (
                  <div>
                    <dt>Experiencia</dt>
                    <dd>{vacancy.experience}</dd>
                  </div>
                )}
              </dl>
              {requirements.length > 0 && (
                <div className="public-vacancy-skills">
                  <h4>Conocimientos y habilidades</h4>
                  <ul>
                    {requirements.map((requirement, index) => (
                      <li key={`${requirement}-${index}`}>{requirement}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
          {activeStep === "schedule" && (
            <section className="public-vacancy-schedule">
              <h3>Jornada y prestaciones</h3>
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
              <div className="public-vacancy-benefits">
                <h4>Prestaciones</h4>
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
              </div>
            </section>
          )}
        </div>

        <footer className="public-vacancy-sheet-footer">
          {stepIndex > 0 && (
            <Button
              onClick={() => setStepIndex(stepIndex - 1)}
              type="button"
              variant="outline"
            >
              <ArrowLeft aria-hidden="true" /> <span>Anterior</span>
            </Button>
          )}
          {stepIndex < steps.length - 1 ? (
            <Button onClick={() => setStepIndex(stepIndex + 1)} type="button">
              Siguiente <ArrowRight aria-hidden="true" />
            </Button>
          ) : (
            <a
              aria-label={`Preguntar por WhatsApp sobre la vacante ${vacancy.title}`}
              className="public-vacancy-sheet-contact"
              href={getVacancyWhatsAppUrl(vacancy)}
              rel="noopener noreferrer"
              target="_blank"
            >
              Consultar por WhatsApp <ArrowRight aria-hidden="true" />
            </a>
          )}
        </footer>
      </SheetContent>
    </Sheet>
  )
}
