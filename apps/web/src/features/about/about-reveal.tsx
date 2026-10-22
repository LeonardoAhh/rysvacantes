import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

type AboutRevealProps = {
  children: ReactNode
  className?: string
}

export function AboutReveal({ children, className }: AboutRevealProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.1, margin: "0px 0px -32px 0px" }}
      whileInView={{ opacity: 1 }}
    >
      {children}
    </motion.div>
  )
}
