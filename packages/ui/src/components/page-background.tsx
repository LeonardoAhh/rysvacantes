import type { ComponentPropsWithoutRef } from "react"
import { cn } from "cn"
import "./page-background.css"

export type PageBackgroundProps = ComponentPropsWithoutRef<"div">

function PageBackground({ className, ...props }: PageBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("page-background", className)}
      data-slot="page-background"
      {...props}
    />
  )
}

export { PageBackground }
