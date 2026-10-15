import { SiteHeader } from "@/components/site-header"
import { routes } from "@/lib/routes"

type LandingHeaderProps = {
  currentPage: "home" | "about" | "contact" | "vacancies"
}

export function LandingHeader({ currentPage }: LandingHeaderProps) {
  const action =
    currentPage === "contact" || currentPage === "about"
      ? { href: routes.vacancies, label: "Vacantes" }
      : { href: routes.contact, label: "Contacto" }

  return <SiteHeader action={action} homeIsCurrent={currentPage === "home"} />
}
