import { Badge } from "@workspace/ui/components/badge"

export function VacancyShiftBadge({
  shift,
  className = "",
}: {
  shift: string
  className?: string
}) {
  if (!shift.trim()) return null

  return (
    <Badge
      className={`max-w-full text-left break-words whitespace-normal ${className}`}
      variant="outline"
    >
      {shift}
    </Badge>
  )
}
