import { Skeleton } from "@workspace/ui/components/skeleton"
import "./vacancy-list-skeleton.css"

export function VacancyListSkeleton({ className }: { className: string }) {
  return (
    <ul aria-label="Preparando vacantes" className={className} role="status">
      {Array.from({ length: 3 }, (_, index) => (
        <li className="vacancy-loading-card" key={index}>
          <Skeleton className="vacancy-loading-label" />
          <Skeleton className="vacancy-loading-title" />
          <Skeleton className="vacancy-loading-detail" />
          <Skeleton className="vacancy-loading-detail vacancy-loading-detail-short" />
        </li>
      ))}
    </ul>
  )
}
