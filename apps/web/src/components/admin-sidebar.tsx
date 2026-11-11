import { useRef, useState } from "react"
import { BarChart3, BriefcaseBusiness, Menu, X } from "lucide-react"
import { SignOutButton } from "@/features/auth/sign-out-button"
import { routes } from "@/lib/routes"
import "./admin-sidebar.css"

const adminLinks = [
  {
    href: routes.dashboard,
    label: "Vacantes",
    icon: BriefcaseBusiness,
  },
  { href: routes.analytics, label: "Visitas", icon: BarChart3 },
] as const

type AdminPath = (typeof adminLinks)[number]["href"]

function AdminNavigation({
  activePath,
  id,
  onNavigate,
}: {
  activePath: AdminPath
  id?: string
  onNavigate?: () => void
}) {
  return (
    <nav
      aria-label="Navegación de administración"
      className="admin-sidebar-nav"
      id={id}
    >
      {adminLinks.map(({ href, label, icon: Icon }) => (
        <a
          aria-current={activePath === href ? "page" : undefined}
          className="admin-sidebar-link"
          href={href}
          key={href}
          onClick={onNavigate}
        >
          <Icon aria-hidden="true" />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  )
}

function AdminBrand({ className }: { className: string }) {
  return (
    <a
      aria-label="ViñoPlastic, panel de administración"
      className={className}
      href={routes.dashboard}
    >
      <span>ViñoPlastic</span>
    </a>
  )
}

export function AdminSidebar({ activePath }: { activePath: AdminPath }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuToggleRef = useRef<HTMLButtonElement>(null)
  const ToggleIcon = menuOpen ? X : Menu

  return (
    <>
      <header
        className="admin-mobile-header"
        onKeyDown={(event) => {
          if (event.key === "Escape" && menuOpen) {
            setMenuOpen(false)
            menuToggleRef.current?.focus()
          }
        }}
      >
        <AdminBrand className="admin-sidebar-brand" />
        <button
          aria-controls="admin-mobile-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          className="admin-menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          ref={menuToggleRef}
          type="button"
        >
          <ToggleIcon aria-hidden="true" />
        </button>
        <div
          className="admin-mobile-navigation"
          hidden={!menuOpen}
          id="admin-mobile-navigation"
        >
          <AdminNavigation
            activePath={activePath}
            onNavigate={() => setMenuOpen(false)}
          />
          <footer className="admin-sidebar-footer">
            <SignOutButton />
          </footer>
        </div>
      </header>
      <aside aria-label="Panel de administración" className="admin-sidebar">
        <AdminBrand className="admin-sidebar-brand" />
        <AdminNavigation activePath={activePath} />
        <footer className="admin-sidebar-footer">
          <SignOutButton />
        </footer>
      </aside>
    </>
  )
}
