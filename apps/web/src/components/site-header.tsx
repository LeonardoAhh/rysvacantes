import type { ReactNode } from "react"
import { ArrowLeft } from "lucide-react"
import { buttonVariants } from "@workspace/ui/components/button"
import { BrandMark } from "./brand-mark"
import { SiteBreadcrumb, type SiteBreadcrumbItem } from "./site-breadcrumb"
import { routes } from "@/lib/routes"
import "./site-header.css"

type SiteHeaderProps = {
  action?: {
    href: string
    label: string
    variant?: "button" | "link"
  }
  actionSlot?: ReactNode
  breadcrumb?: readonly SiteBreadcrumbItem[]
  homeIsCurrent?: boolean
  mobileBack?: boolean
}

export function SiteHeader({
  action,
  actionSlot,
  breadcrumb,
  homeIsCurrent = false,
  mobileBack = false,
}: SiteHeaderProps) {
  const parent = mobileBack ? breadcrumb?.at(-2) : undefined

  return (
    <header
      className={parent?.href ? "site-header site-header--with-back" : "site-header"}
    >
      <div className="site-header-inner page-container">
        {parent?.href && (
          <a
            aria-label={`Volver a ${parent.label}`}
            className="site-header-mobile-back"
            href={parent.href}
          >
            <ArrowLeft aria-hidden="true" />
          </a>
        )}
        <a
          aria-current={homeIsCurrent ? "page" : undefined}
          aria-label="ViñoPlastic, inicio"
          className="site-header-brand"
          href={routes.home}
        >
          <BrandMark className="site-header-brand-mark" />
          <span>ViñoPlastic</span>
        </a>
        {breadcrumb && <SiteBreadcrumb items={breadcrumb} />}
        {actionSlot ??
          (action && (
            <a
              className={
                action.variant === "link"
                  ? "site-header-action-link"
                  : `${buttonVariants({ size: "lg" })} site-header-action-button`
              }
              href={action.href}
            >
              {action.label}
            </a>
          ))}
      </div>
    </header>
  )
}
