export const legalBenefitsLabel = "Prestaciones de ley"

export type BenefitSelection = {
  savingsFund: boolean
  savingsRate: string
  foodVouchers: boolean
  staffTransport: boolean
  other: string[]
}

const legalBenefitNames = new Set([
  "prestaciones de ley",
  "imss",
  "infonavit",
  "vacaciones",
  "aguinaldo",
])

export function getVacancyBenefits(value: string): string[] {
  return value
    .split(/,(?!\d)|(?<!\d),|[;\n]+/)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean)
}

export function parseBenefitSelection(value: string): BenefitSelection {
  const selection: BenefitSelection = {
    savingsFund: false,
    savingsRate: "",
    foodVouchers: false,
    staffTransport: false,
    other: [],
  }

  for (const item of getVacancyBenefits(value)) {
    const normalized = item.toLocaleLowerCase("es-MX")
    if (legalBenefitNames.has(normalized)) continue

    const savingsFund = item.match(/^fondo de ahorro(?:\s+([\d.,]+%?))?$/iu)
    if (savingsFund) {
      selection.savingsFund = true
      selection.savingsRate = (savingsFund[1] ?? "").replace(/%$/, "").trim()
    } else if (normalized === "vales de despensa") {
      selection.foodVouchers = true
    } else if (normalized === "transporte de personal") {
      selection.staffTransport = true
    } else {
      selection.other.push(item)
    }
  }

  return selection
}

export function serializeBenefitSelection(selection: BenefitSelection): string {
  return [
    legalBenefitsLabel,
    selection.savingsFund
      ? `Fondo de ahorro${selection.savingsRate.trim() ? ` ${selection.savingsRate.trim().replace(/%+$/, "")}%` : ""}`
      : null,
    selection.foodVouchers ? "Vales de despensa" : null,
    selection.staffTransport ? "Transporte de personal" : null,
    ...selection.other,
  ]
    .filter(Boolean)
    .join("\n")
}

export function getPublicBenefits(value: string): string[] {
  return getVacancyBenefits(
    serializeBenefitSelection(parseBenefitSelection(value))
  ).filter((item) => item.toLocaleLowerCase("es-MX") !== "por definir")
}

export function isValidSavingsRate(rate: string): boolean {
  if (rate.trim() === "") return true
  if (!/^\d{1,3}(?:[.,]\d{1,2})?$/.test(rate)) return false
  const numericRate = Number(rate.replace(",", "."))
  return numericRate > 0 && numericRate <= 100
}
