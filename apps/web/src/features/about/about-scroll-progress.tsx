import { motion, useScroll } from "motion/react"
import "./about-scroll-progress.css"

export function AboutScrollProgress() {
  const { scrollYProgress } = useScroll()

  return (
    <motion.div
      aria-hidden="true"
      className="about-scroll-progress"
      style={{ scaleX: scrollYProgress }}
    />
  )
}
