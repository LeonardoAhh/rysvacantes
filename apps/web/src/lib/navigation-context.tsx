import { createContext, useContext } from "react"

export type NavigateOptions = { replace?: boolean }
export type Navigate = (to: string, options?: NavigateOptions) => void

export const NavigationContext = createContext<Navigate | null>(null)

export function useNavigate() {
  const navigate = useContext(NavigationContext)
  if (!navigate) throw new Error("La navegación no está disponible.")
  return navigate
}
