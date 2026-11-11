import { useRef, type ReactNode } from "react"
import { useInView, useReducedMotion } from "motion/react"

type AboutRevealProps = {
  children: ReactNode
  className?: string
}

export function AboutReveal({ children, className }: AboutRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, {
    once: true,
    amount: 0.35,
  })
  const reduceMotion = useReducedMotion()

  return (
    <div
      className={className ? `about-reveal ${className}` : "about-reveal"}
      data-revealed={isInView || reduceMotion ? "true" : "false"}
      ref={ref}
    >
      {children}
    </div>
  )
}
