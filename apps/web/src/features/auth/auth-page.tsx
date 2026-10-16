import { useEffect, useState, type FormEvent } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { PageBackground } from "@workspace/ui/components/page-background"
import { Spinner } from "@workspace/ui/components/spinner"
import { useNavigate } from "@/lib/navigation-context"
import { routes } from "@/lib/routes"
import { supabase } from "@/lib/supabase"
import { emailForUsername } from "./auth-credentials"
import { useAuthUser } from "./use-auth-user"
import "./auth.css"

export function AuthPage() {
  const navigate = useNavigate()
  const auth = useAuthUser()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState("")
  const notice =
    feedback ||
    (auth.status === "unavailable"
      ? "El acceso no está configurado. Contacta al administrador."
      : auth.status === "error"
        ? "No pudimos verificar tu sesión. Puedes intentar entrar de nuevo."
        : "")

  useEffect(() => {
    if (auth.status === "authenticated") {
      navigate(routes.dashboard, { replace: true })
    }
  }, [auth.status, navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const email = emailForUsername(username)
    if (!email) {
      setFeedback("Escribe un usuario válido, sin correo electrónico.")
      return
    }
    if (!supabase) {
      setFeedback("El acceso no está disponible en este momento.")
      return
    }

    setSubmitting(true)
    setFeedback("")
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setFeedback(
          "No pudimos iniciar sesión. Revisa tu usuario y contraseña."
        )
      } else {
        navigate(routes.dashboard, { replace: true })
      }
    } catch {
      setFeedback("No pudimos conectar con el servicio. Inténtalo de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <PageBackground />
      <section aria-labelledby="auth-title" className="auth-card">
        <h1 id="auth-title">Inicia sesión</h1>

        <form
          aria-describedby={notice ? "auth-feedback" : undefined}
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <div className="auth-field">
            <Label htmlFor="auth-username">Usuario</Label>
            <Input
              autoCapitalize="none"
              autoComplete="username"
              disabled={auth.status === "unavailable" || submitting}
              id="auth-username"
              maxLength={64}
              name="username"
              onChange={(event) => setUsername(event.target.value)}
              required
              spellCheck={false}
              type="text"
              value={username}
            />
          </div>
          <div className="auth-field">
            <Label htmlFor="auth-password">Contraseña</Label>
            <Input
              autoComplete="current-password"
              disabled={auth.status === "unavailable" || submitting}
              id="auth-password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>
          <Button
            aria-busy={submitting}
            className="auth-submit"
            disabled={auth.status === "unavailable" || submitting}
            size="lg"
            type="submit"
          >
            {submitting && <Spinner aria-hidden="true" />}
            Entrar
          </Button>
        </form>

        {notice && (
          <p className="auth-notice" id="auth-feedback" role="alert">
            {notice}
          </p>
        )}
      </section>
    </main>
  )
}
