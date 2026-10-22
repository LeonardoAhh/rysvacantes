import { ArrowRight } from "lucide-react"
import { getVacancyWhatsAppUrl } from "@/lib/recruitment-contact"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { PublicVacancyDetailsDialog } from "./public-vacancy-details-dialog"
import { PublicVacancySummary } from "./public-vacancy-summary"
import { VacancyShiftBadge } from "./vacancy-shift-badge"
import { hasCompleteVacancyDetails, type Vacancy } from "./vacancy-types"

export function PublicVacancyCard({ vacancy }: { vacancy: Vacancy }) {
  return (
    <li className="public-vacancy-item">
      <Card className="public-vacancy-card">
        <CardHeader className="public-vacancy-card-header">
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
          <CardTitle className="public-vacancy-title">
            <h2>{vacancy.title}</h2>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <PublicVacancySummary vacancy={vacancy} />
          <PublicVacancyDetailsDialog vacancy={vacancy} />
          <a
            aria-label={`Preguntar por WhatsApp sobre la vacante ${vacancy.title}`}
            className="public-vacancy-contact"
            href={getVacancyWhatsAppUrl(vacancy)}
            rel="noopener noreferrer"
            target="_blank"
          >
            Consultar por WhatsApp
            <ArrowRight aria-hidden="true" />
          </a>
        </CardContent>
      </Card>
    </li>
  )
}
