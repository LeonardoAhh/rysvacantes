import { useLayoutEffect, useRef } from "react"
import type { Vacancy } from "./vacancy-types"

export function useVacancyMasonry(
  vacancies: readonly Vacancy[],
  enabled: boolean
) {
  const listRef = useRef<HTMLUListElement>(null)

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    if (!enabled || typeof ResizeObserver === "undefined") {
      delete list.dataset.masonry
      return
    }

    const cards = Array.from(list.children).map((item) => ({
      item: item as HTMLLIElement,
      card: item.firstElementChild,
    }))
    let frame = 0

    function layout() {
      if (!list) return

      const columnCount = getComputedStyle(list)
        .gridTemplateColumns.split(" ")
        .filter(Boolean).length

      if (columnCount < 2) {
        delete list.dataset.masonry
        return
      }

      list.dataset.masonry = "true"
      const styles = getComputedStyle(list)
      const rowHeight = Number.parseFloat(styles.gridAutoRows)
      const gap = Number.parseFloat(styles.columnGap)
      if (!Number.isFinite(rowHeight) || rowHeight <= 0) return

      for (const { item, card } of cards) {
        if (!card) continue
        const span = Math.ceil(
          (card.getBoundingClientRect().height +
            (Number.isFinite(gap) ? gap : 0)) /
            rowHeight
        )
        const nextSpan = String(span)
        if (item.style.getPropertyValue("--masonry-span") !== nextSpan) {
          item.style.setProperty("--masonry-span", nextSpan)
        }
      }
    }

    const observer = new ResizeObserver(() => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(layout)
    })

    layout()
    observer.observe(list)
    for (const { card } of cards) {
      if (card) observer.observe(card)
    }

    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      delete list.dataset.masonry
    }
  }, [vacancies, enabled])

  return listRef
}
