import type { ReactNode } from "react"
import { buttonVariants } from "@workspace/ui/components/button"
import { BrandMark } from "./brand-mark"
import { routes } from "@/lib/routes"
import "./site-header.css"

type SiteHeaderProps = {
  action?: {
    href: string
    label: string
    variant?: "button" | "link"
  }
  actionSlot?: ReactNode
  homeIsCurrent?: boolean
}

export function SiteHeader({
  action,
  actionSlot,
  homeIsCurrent = false,
}: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header-inner page-container">
        <a
          aria-current={homeIsCurrent ? "page" : undefined}
          aria-label="ViñoPlastic, inicio"
          className="site-header-brand"
          href={routes.home}
        >
          <BrandMark className="site-header-brand-mark" />
          <span>ViñoPlastic</span>
        </a>
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
