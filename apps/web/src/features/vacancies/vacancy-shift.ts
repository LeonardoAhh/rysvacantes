const shiftSuffix = /^(.*?\S)\s*[-–—]\s*(Turno\s+[\p{L}\p{N}]+)\s*$/iu

export function splitVacancyShiftFromTitle(title: string, shift: string) {
  const match = title.match(shiftSuffix)
  if (!match) return { title, shift }

  return {
    title: match[1].trim(),
    shift:
      shift.trim() || match[2].replace(/^turno/i, "Turno").replace(/\s+/g, " "),
  }
}
