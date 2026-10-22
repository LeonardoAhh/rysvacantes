import { useState } from "react"
import { LogOut } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { useNavigate } from "@/lib/navigation-context"
import { routes } from "@/lib/routes"
import { supabase } from "@/lib/supabase"

export function SignOutButton() {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function handleSignOut() {
    if (!supabase || busy) return
    setBusy(true)
    setError("")

    try {
      const { error: signOutError } = await supabase.auth.signOut({
        scope: "local",
      })
      if (signOutError) throw signOutError
      navigate(routes.auth, { replace: true })
    } catch {
      setError("No pudimos cerrar la sesión. Inténtalo de nuevo.")
      setBusy(false)
    }
  }

  return (
    <span className="dashboard-sign-out">
      <Button
        aria-label="Cerrar sesión"
        disabled={busy}
        onClick={handleSignOut}
        size="sm"
        variant="ghost"
      >
        <LogOut aria-hidden="true" />
        <span className="dashboard-sign-out-label">Cerrar sesión</span>
      </Button>
      {error && <span role="alert">{error}</span>}
    </span>
  )
}
