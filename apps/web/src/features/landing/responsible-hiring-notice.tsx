import { ChevronDown } from "lucide-react"
import "./responsible-hiring-notice.css"

const commitments = [
  {
    title: "Verificamos tu edad",
    description:
      "Las oportunidades están dirigidas a personas de 18 años o más. Durante la selección revisamos una identificación oficial vigente.",
  },
  {
    title: "Participas por decisión propia",
    description:
      "Participar en la selección y aceptar una oferta es tu decisión, sin presiones, engaños ni amenazas.",
  },
  {
    title: "Sin retención de documentos ni deudas",
    description:
      "No retenemos tus documentos personales ni imponemos deudas por reclutamiento, capacitación, uniformes o herramientas.",
  },
] as const

export function ResponsibleHiringNotice() {
  return (
    <section
      aria-labelledby="responsible-hiring-title"
      className="responsible-hiring-notice page-container"
    >
      <p className="responsible-hiring-eyebrow">Nuestro compromiso</p>
      <h2 id="responsible-hiring-title">Reclutamiento libre y seguro</h2>
      <p className="responsible-hiring-description">
        Prevenimos el trabajo forzado, el trabajo infantil y la trata de
        personas con una selección responsable.
      </p>
      <details className="responsible-hiring-details">
        <summary>
          <span className="responsible-hiring-show">Ver compromisos</span>
          <span className="responsible-hiring-hide">Ocultar compromisos</span>
          <ChevronDown aria-hidden="true" />
        </summary>
        <ul className="responsible-hiring-commitments">
          {commitments.map(({ title, description }) => (
            <li key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ul>
      </details>
    </section>
  )
}
