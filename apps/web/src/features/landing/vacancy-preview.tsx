import { ArrowRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useVacancyPage } from "@/features/vacancies/use-vacancy-page"
import { vacancySalaryPeriodLabels } from "@/features/vacancies/vacancy-types"
import { routes, vacancyQueryParam, vacanciesListAnchorId } from "@/lib/routes"
import "./vacancy-preview.css"

export function VacancyPreview() {
  const { vacancies, loading, error, reload } = useVacancyPage({
    scope: "public",
    page: 0,
    search: "",
    pageSize: 3,
  })
  return (
    <section
      aria-labelledby="home-vacancies-title"
      className="home-vacancies page-container"
    >
      <div className="home-vacancies-heading">
        <div>
          <p className="eyebrow">Tu próximo paso</p>
          <h2 id="home-vacancies-title">Oportunidades actuales</h2>
        </div>
        <a className="text-link" href={routes.vacancies}>
          Ver todas <ArrowRight aria-hidden="true" />
        </a>
      </div>
      {loading ? (
        <div
          aria-label="Cargando oportunidades"
          className="home-vacancy-grid"
          role="status"
        >
          {[0, 1, 2].map((index) => (
            <Skeleton className="home-vacancy-skeleton" key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="home-vacancy-status" role="status">
          <p>
            No pudimos cargar las oportunidades. Puedes consultar el listado o
            pedir información a Reclutamiento.
          </p>
          <Button onClick={reload} type="button" variant="outline">
            Reintentar
          </Button>
        </div>
      ) : vacancies.length ? (
        <ul className="home-vacancy-grid">
          {vacancies.map((vacancy) => (
            <li key={vacancy.id}>
              <a
                className="home-vacancy-preview"
                href={`${routes.vacancies}?search=${encodeURIComponent(vacancy.title)}&${vacancyQueryParam}=${encodeURIComponent(vacancy.id)}#${vacanciesListAnchorId}`}
              >
                <span className="home-vacancy-meta">
                  {vacancy.area}
                  {vacancy.shift && ` · ${vacancy.shift}`}
                </span>
                <h3>{vacancy.title}</h3>
                <span className="home-vacancy-pay">
                  Sueldo bruto{" "}
                  <strong>
                    {vacancy.salary.trim() || "Por definir"} ·{" "}
                    {vacancy.salaryPeriod
                      ? vacancySalaryPeriodLabels[vacancy.salaryPeriod]
                      : "Período por definir"}
                  </strong>
                </span>
                <span className="home-vacancy-open">
                  Consultar vacante <ArrowRight aria-hidden="true" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="home-vacancy-status">
          Por ahora no hay vacantes publicadas. Vuelve pronto para conocer
          nuevas oportunidades.
        </p>
      )}
      <p className="home-vacancies-contact">
        ¿Necesitas orientación?{" "}
        <a href={routes.contact}>
          Habla con Reclutamiento <ArrowRight aria-hidden="true" />
        </a>
      </p>
    </section>
  )
}
