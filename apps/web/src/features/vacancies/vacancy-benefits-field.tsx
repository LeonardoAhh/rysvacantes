import { useState } from "react"
import { Check } from "lucide-react"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  getVacancyBenefits,
  legalBenefitsLabel,
  parseBenefitSelection,
  serializeBenefitSelection,
  type BenefitSelection,
} from "./vacancy-benefits"
import { VacancyFieldError } from "./vacancy-field-error"

type VacancyBenefitsFieldProps = {
  value: string
  error?: string
  onChange: (value: string) => void
  onBlur: () => void
}

export function VacancyBenefitsField({
  value,
  error,
  onChange,
  onBlur,
}: VacancyBenefitsFieldProps) {
  const selection = parseBenefitSelection(value)
  const [otherText, setOtherText] = useState(() => selection.other.join("\n"))

  function updateSelection(next: Partial<BenefitSelection>) {
    onChange(serializeBenefitSelection({ ...selection, ...next }))
  }

  return (
    <fieldset
      aria-describedby={error ? "vacancy-benefits-error" : undefined}
      className="vacancy-benefits-field vacancy-form-field vacancy-form-field-wide"
      id="vacancy-benefits"
      tabIndex={-1}
    >
      <legend>Prestaciones</legend>
      <p className="vacancy-benefits-included">
        <Check aria-hidden="true" />
        <span>{legalBenefitsLabel}</span>
        <span className="vacancy-benefits-always">Incluidas siempre</span>
      </p>
      <div className="vacancy-benefits-options">
        <div className="vacancy-benefits-option">
          <Checkbox
            checked={selection.savingsFund}
            id="vacancy-savings-fund"
            onCheckedChange={(checked) =>
              updateSelection({
                savingsFund: checked,
                savingsRate: checked ? selection.savingsRate : "",
              })
            }
          />
          <Label htmlFor="vacancy-savings-fund">Fondo de ahorro</Label>
        </div>
        <div className="vacancy-benefits-option">
          <Checkbox
            checked={selection.foodVouchers}
            id="vacancy-food-vouchers"
            onCheckedChange={(checked) =>
              updateSelection({ foodVouchers: checked })
            }
          />
          <Label htmlFor="vacancy-food-vouchers">Vales de despensa</Label>
        </div>
        <div className="vacancy-benefits-option">
          <Checkbox
            checked={selection.staffTransport}
            id="vacancy-staff-transport"
            onCheckedChange={(checked) =>
              updateSelection({ staffTransport: checked })
            }
          />
          <Label htmlFor="vacancy-staff-transport">
            Transporte de personal
          </Label>
        </div>
      </div>
      {selection.savingsFund && (
        <div className="vacancy-benefits-rate">
          <Label htmlFor="vacancy-savings-rate">
            Porcentaje del fondo de ahorro (opcional)
          </Label>
          <div className="vacancy-benefits-rate-input">
            <Input
              aria-invalid={Boolean(error)}
              id="vacancy-savings-rate"
              inputMode="decimal"
              onBlur={onBlur}
              onChange={(event) =>
                updateSelection({
                  savingsRate: event.target.value.replace(/[^\d.,]/g, ""),
                })
              }
              type="text"
              value={selection.savingsRate}
            />
            <span aria-hidden="true">%</span>
          </div>
        </div>
      )}
      <div className="vacancy-benefits-other">
        <Label htmlFor="vacancy-other-benefits">
          Otras prestaciones (opcional)
        </Label>
        <Textarea
          id="vacancy-other-benefits"
          onBlur={onBlur}
          onChange={(event) => {
            const nextText = event.target.value
            setOtherText(nextText)
            updateSelection({ other: getVacancyBenefits(nextText) })
          }}
          rows={2}
          value={otherText}
        />
        <p className="vacancy-field-hint">
          Escribe una prestación por renglón si aplica.
        </p>
      </div>
      <VacancyFieldError field="vacancy-benefits" message={error} />
    </fieldset>
  )
}
