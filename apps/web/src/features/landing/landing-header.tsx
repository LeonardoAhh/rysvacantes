import { useState } from "react"
import { Menu } from "lucide-react"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { SiteHeader } from "@/components/site-header"
import { routes } from "@/lib/routes"

type LandingHeaderProps = {
  currentPage: "home" | "about" | "contact" | "transport" | "vacancies"
}

export function LandingHeader({ currentPage }: LandingHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const action =
    currentPage === "vacancies"
      ? { href: routes.contact, label: "Contacto" }
      : { href: routes.vacancies, label: "Vacantes" }

  const links = [
    { page: "home", href: routes.home, label: "Inicio" },
    { page: "vacancies", href: routes.vacancies, label: "Vacantes" },
    { page: "about", href: routes.about, label: "Empresa" },
    { page: "transport", href: routes.transport, label: "Transporte" },
    { page: "contact", href: routes.contact, label: "Contacto" },
  ].filter((link) => link.href !== action.href)

  return (
    <SiteHeader
      homeIsCurrent={currentPage === "home"}
      actionSlot={
        <div className="public-header-actions">
          <nav aria-label="Navegación principal" className="public-desktop-nav">
            {links
              .filter((link) => link.page !== "home")
              .map((link) => (
                <a
                  aria-current={link.page === currentPage ? "page" : undefined}
                  href={link.href}
                  key={link.page}
                >
                  {link.label}
                </a>
              ))}
          </nav>
          <div className="public-mobile-nav">
            <Popover onOpenChange={setMenuOpen} open={menuOpen}>
              <PopoverTrigger
                render={
                  <Button
                    aria-label="Abrir menú de navegación"
                    size="icon"
                    variant="ghost"
                  />
                }
              >
                <Menu aria-hidden="true" />
              </PopoverTrigger>
              <PopoverContent align="end" className="public-navigation-menu">
                <PopoverTitle className="sr-only">
                  Navegación principal
                </PopoverTitle>
                <nav aria-label="Navegación principal">
                  {links.map((link) => (
                    <a
                      aria-current={
                        link.page === currentPage ? "page" : undefined
                      }
                      href={link.href}
                      key={link.page}
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              </PopoverContent>
            </Popover>
          </div>
          <a
            className={`${buttonVariants({ size: "lg" })} site-header-action-button`}
            href={action.href}
          >
            {action.label}
          </a>
        </div>
      }
    />
  )
}
