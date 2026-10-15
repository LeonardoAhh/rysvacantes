import type { ComponentPropsWithoutRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import "./page-background.css"

const pageBackgroundVariants = cva("page-background", {
  variants: {
    variant: {
      technical: "page-background-technical",
      subtle: "page-background-subtle",
      quiet: "page-background-quiet",
    },
  },
  defaultVariants: {
    variant: "technical",
  },
})

export type PageBackgroundProps = ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof pageBackgroundVariants>

function PageBackground({ className, variant, ...props }: PageBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(pageBackgroundVariants({ variant }), className)}
      data-slot="page-background"
      {...props}
    />
  )
}

export { PageBackground }
