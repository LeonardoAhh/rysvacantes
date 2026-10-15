import { Button } from "@workspace/ui/components/button"
import { vacancyPageSize } from "./vacancy-repository"
import "./vacancy-pagination.css"

type VacancyPaginationProps = {
  page: number
  total: number
  onPageChange: (page: number) => void
}

export function VacancyPagination({
  page,
  total,
  onPageChange,
}: VacancyPaginationProps) {
  const pages = Math.ceil(total / vacancyPageSize)
  if (pages <= 1) return null

  return (
    <nav aria-label="Páginas de vacantes" className="vacancy-pagination">
      <Button
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        size="sm"
        type="button"
        variant="outline"
      >
        Anterior
      </Button>
      <span aria-live="polite">
        Página {page + 1} de {pages}
      </span>
      <Button
        disabled={page >= pages - 1}
        onClick={() => onPageChange(page + 1)}
        size="sm"
        type="button"
        variant="outline"
      >
        Siguiente
      </Button>
    </nav>
  )
}
