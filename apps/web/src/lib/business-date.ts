const businessDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Mexico_City",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

export function getBusinessDate(date = new Date()) {
  const parts = businessDateFormatter.formatToParts(date)
  return ["year", "month", "day"]
    .map((type) => parts.find((part) => part.type === type)!.value)
    .join("-")
}
