import { Plus } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

export function DashboardIntro({
  editingEnabled,
  onCreate,
}: {
  editingEnabled: boolean
  onCreate: () => void
}) {
  return (
    <section aria-labelledby="dashboard-title" className="dashboard-intro">
      <div>
        <p className="dashboard-eyebrow">Panel de administración</p>
        <h1 id="dashboard-title">Gestión de vacantes</h1>
        <p className="dashboard-description">
          Crea y organiza las oportunidades de tu equipo.
        </p>
      </div>
      <div className="dashboard-intro-actions">
        <Button
          className="dashboard-create-button"
          disabled={!editingEnabled}
          onClick={onCreate}
          size="lg"
        >
          <Plus aria-hidden="true" />
          Nueva vacante
        </Button>
      </div>
    </section>
  )
}
