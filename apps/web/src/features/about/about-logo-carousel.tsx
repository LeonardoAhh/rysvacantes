import { useEffect, useRef, useState } from "react"
import { useInView, useMotionValueEvent, useScroll } from "motion/react"
import { clientLogos } from "./about-content"
import "./about-logo-carousel.css"

const SCROLL_IDLE_DELAY_MS = 160

export function AboutLogoCarousel() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollingRef = useRef(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const isInView = useInView(viewportRef, { amount: 0.1 })
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", () => {
    if (!isInView) return

    if (!scrollingRef.current) {
      scrollingRef.current = true
      setIsScrolling(true)
    }
    if (idleTimer.current) clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => {
      scrollingRef.current = false
      setIsScrolling(false)
    }, SCROLL_IDLE_DELAY_MS)
  })

  useEffect(() => {
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current)
    }
  }, [])

  return (
    <div className="about-clients">
      <h3>Empresas con las que hemos trabajado</h3>
      <div
        aria-label="Empresas con las que hemos trabajado"
        className="about-carousel-viewport"
        ref={viewportRef}
        role="region"
        tabIndex={0}
      >
        <div
          className="about-carousel-track"
          data-active={isInView && !isScrolling}
        >
          <ul className="about-carousel-list">
            {clientLogos.map((client) => (
              <li key={client.name}>
                <img
                  alt={client.name}
                  decoding="async"
                  loading="eager"
                  src={client.image}
                />
              </li>
            ))}
          </ul>
          <ul aria-hidden="true" className="about-carousel-list">
            {clientLogos.map((client) => (
              <li key={client.name}>
                <img
                  alt=""
                  decoding="async"
                  loading="eager"
                  src={client.image}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
