import { Badge } from "@workspace/ui/components/badge"

export function VacancyShiftBadge({ shift }: { shift: string }) {
  if (!shift.trim()) return null

  return (
    <Badge
      className="max-w-full text-left break-words whitespace-normal"
      variant="outline"
    >
      {shift}
    </Badge>
  )
}
