import { useEffect, useState, type ReactNode } from "react"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { PageBackground } from "@workspace/ui/components/page-background"
import { SiteHeader } from "@/components/site-header"
import { useNavigate } from "@/lib/navigation-context"
import { routes } from "@/lib/routes"
import { useAuthUser } from "./use-auth-user"
import { isVacancyEditor } from "@/features/vacancies/vacancy-repository"
import "./dashboard-access.css"

export function DashboardAccess({ children }: { children: ReactNode }) {
  const auth = useAuthUser()
  const navigate = useNavigate()
  const [editor, setEditor] = useState<{
    userId: string
    status: "allowed" | "denied" | "error"
  } | null>(null)

  useEffect(() => {
    if (auth.status === "anonymous") {
      navigate(routes.auth, { replace: true })
    }
  }, [auth.status, navigate])

  useEffect(() => {
    if (auth.status !== "authenticated") return
    let active = true
    void isVacancyEditor()
      .then((allowed) => {
        if (active) {
          setEditor({
            userId: auth.user.id,
            status: allowed ? "allowed" : "denied",
          })
        }
      })
      .catch(() => {
        if (active) setEditor({ userId: auth.user.id, status: "error" })
      })
    return () => {
      active = false
    }
  }, [auth.status, auth.user?.id])

  if (
    auth.status === "authenticated" &&
    editor?.userId === auth.user.id &&
    editor.status === "allowed"
  )
    return children

  if (
    auth.status === "unavailable" ||
    auth.status === "error" ||
    (auth.status === "authenticated" &&
      editor?.userId === auth.user.id &&
      editor.status !== "allowed")
  ) {
    const denied =
      auth.status === "authenticated" && editor?.status === "denied"
    return (
      <div className="dashboard-access-page">
        <PageBackground variant="quiet" />
        <SiteHeader />
        <main className="dashboard-access-message page-container">
          <h1>
            {denied
              ? "Sin permiso para gestionar vacantes"
              : "Acceso no disponible"}
          </h1>
          <p>
            {denied
              ? "Tu cuenta no tiene acceso al panel. Solicita permiso al administrador."
              : auth.status === "unavailable"
                ? "La conexión de acceso aún no está configurada. Contacta al administrador."
                : "No pudimos verificar tu acceso. Revisa tu conexión e inténtalo de nuevo."}
          </p>
          {!denied && (
            <Button onClick={() => window.location.reload()} variant="outline">
              Reintentar
            </Button>
          )}
        </main>
      </div>
    )
  }

  return (
    <div
      aria-label="Verificando el acceso"
      className="dashboard-access-page"
      role="status"
    >
      <PageBackground variant="quiet" />
      <div className="dashboard-access-header page-container">
        <Skeleton className="dashboard-access-brand" />
      </div>
      <div className="dashboard-access-content page-container">
        <Skeleton className="dashboard-access-title" />
        <Skeleton className="dashboard-access-line" />
      </div>
    </div>
  )
}
