import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { isAllowedAuthEmail, isAuthDomainConfigured } from "./auth-credentials"

type AuthState =
  | { status: "checking"; user: null }
  | { status: "authenticated"; user: User }
  | { status: "anonymous" | "unavailable" | "error"; user: null }

const initialState: AuthState =
  supabase && isAuthDomainConfigured()
    ? { status: "checking", user: null }
    : { status: "unavailable", user: null }

export function useAuthUser() {
  const [state, setState] = useState<AuthState>(initialState)

  useEffect(() => {
    if (!supabase || !isAuthDomainConfigured()) return

    let active = true
    let authVersion = 0
    function verifyUser() {
      if (!supabase) return
      const version = ++authVersion
      void supabase.auth
        .getUser()
        .then(({ data, error }) => {
          if (!active || version !== authVersion) return
          if (error && error.name !== "AuthSessionMissingError") {
            setState({ status: "error", user: null })
          } else if (data.user && isAllowedAuthEmail(data.user.email)) {
            setState({ status: "authenticated", user: data.user })
          } else {
            setState({ status: "anonymous", user: null })
          }
        })
        .catch(() => {
          if (active && version === authVersion) {
            setState({ status: "error", user: null })
          }
        })
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (!active || event === "INITIAL_SESSION") return
      if (event === "SIGNED_OUT") {
        authVersion += 1
        setState({ status: "anonymous", user: null })
      } else if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        window.setTimeout(verifyUser, 0)
      }
    })

    const initialTimer = window.setTimeout(verifyUser, 0)

    return () => {
      active = false
      window.clearTimeout(initialTimer)
      subscription.unsubscribe()
    }
  }, [])

  return state
}
