import { useLayoutEffect, useState } from "react"
import { useReducedMotion } from "motion/react"
import { ArrowDown } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import "./about-page-navigation.css"

export function AboutPageNavigation() {
  const [atBottom, setAtBottom] = useState(false)
  const reduceMotion = useReducedMotion()

  useLayoutEffect(() => {
    const updatePosition = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      setAtBottom(maxScroll - window.scrollY <= 2)
    }

    updatePosition()
    window.addEventListener("scroll", updatePosition, { passive: true })
    window.addEventListener("resize", updatePosition)
    const content = document.getElementById("about-content")
    const resizeObserver = new ResizeObserver(updatePosition)
    if (content) resizeObserver.observe(content)

    return () => {
      window.removeEventListener("scroll", updatePosition)
      window.removeEventListener("resize", updatePosition)
      resizeObserver.disconnect()
    }
  }, [])

  const moveThroughPage = () => {
    const behavior = reduceMotion ? "instant" : "smooth"
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)

    if (maxScroll - window.scrollY <= 2) {
      document.getElementById("about-title")?.focus({ preventScroll: true })
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname + window.location.search
      )
      window.scrollTo({ top: 0, behavior })
      return
    }

    const nextY = Math.min(window.scrollY + window.innerHeight * 0.8, maxScroll)
    window.scrollTo({ top: nextY, behavior })
  }

  return (
    <div className="about-page-navigation">
      <Button
        aria-label={atBottom ? "Volver al inicio" : "Seguir bajando"}
        className="about-page-navigation-button"
        data-at-bottom={atBottom}
        onClick={moveThroughPage}
        type="button"
        variant="outline"
      >
        <ArrowDown aria-hidden="true" />
        <span aria-hidden="true" className="about-page-navigation-label">
          Inicio
        </span>
      </Button>
    </div>
  )
}
