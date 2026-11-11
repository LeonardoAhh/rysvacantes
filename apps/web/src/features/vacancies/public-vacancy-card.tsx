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
import { VacancyWhatsAppContact } from "./vacancy-whatsapp-contact"
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
            <h3>{vacancy.title}</h3>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <PublicVacancySummary vacancy={vacancy} />
          <div className="public-vacancy-actions">
            <PublicVacancyDetailsDialog vacancy={vacancy} />
            <VacancyWhatsAppContact
              className="public-vacancy-contact"
              vacancy={vacancy}
            />
          </div>
        </CardContent>
      </Card>
    </li>
  )
}
