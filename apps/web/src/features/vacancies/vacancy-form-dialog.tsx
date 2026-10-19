import { useEffect, useRef, useState, type FormEvent } from "react"
import { getBusinessDate } from "@/lib/business-date"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { VacancyDetailsFields } from "./vacancy-details-fields"
import {
  legalBenefitsLabel,
  parseBenefitSelection,
  serializeBenefitSelection,
} from "./vacancy-benefits"
import { VacancyGeneralFields } from "./vacancy-general-fields"
import { VacancyRequirementsFields } from "./vacancy-requirements-fields"
import {
  getFieldStep,
  getVacancyFieldId,
  vacancyFormSteps,
  type VacancyFormStep,
} from "./vacancy-form-steps"
import {
  normalizeVacancyField,
  normalizeVacancyForm,
  vacancyFieldOrder,
  validateVacancyForm,
  type VacancyFormErrors,
  type VacancyTextField,
} from "./vacancy-form-validation"
import type { Vacancy, VacancyFormValues } from "./vacancy-types"
import { splitVacancyShiftFromTitle } from "./vacancy-shift"
import {
  vacancyOptions,
  normalizeVacancyOption,
  formatVacancySalary,
  type VacancyOptionField,
} from "./vacancy-options"
import "./vacancy-form-dialog.css"

type VacancyFormDialogProps = {
  vacancy: Vacancy | null
  onClose: () => void
  onSave: (values: VacancyFormValues, requestId: string) => Promise<void>
}

const emptyForm: VacancyFormValues = {
  title: "",
  shift: "",
  area: "",
  location: "",
  modality: "",
  employmentType: vacancyOptions.employmentType[0],
  description: "",
  education: "",
  experience: "",
  requirements: "",
  workSchedule: "",
  workDays: "",
  restDays: "",
  salary: "",
  salaryPeriod: null,
  benefits: legalBenefitsLabel,
  status: "draft",
  deadline: "",
}

function getInitialForm(vacancy: Vacancy | null): VacancyFormValues {
  if (!vacancy) return emptyForm

  const editableDetail = (value: string) =>
    vacancy.isDemo && value.trim().toLocaleLowerCase("es-MX") === "por definir"
      ? ""
      : value
  const position = splitVacancyShiftFromTitle(vacancy.title, vacancy.shift)

  const values = {
    title: position.title,
    shift: position.shift,
    area: vacancy.area,
    location: vacancy.location,
    modality: vacancy.modality,
    employmentType: vacancy.employmentType,
    description: vacancy.isDemo ? "" : vacancy.description,
    education: vacancy.education,
    experience: vacancy.experience,
    requirements: vacancy.requirements,
    workSchedule: editableDetail(vacancy.workSchedule),
    workDays: editableDetail(vacancy.workDays),
    restDays: editableDetail(vacancy.restDays),
    salary: editableDetail(vacancy.salary),
    salaryPeriod: vacancy.salaryPeriod,
    benefits: serializeBenefitSelection(
      parseBenefitSelection(editableDetail(vacancy.benefits))
    ),
    status: vacancy.status,
    deadline: vacancy.deadline,
  } satisfies VacancyFormValues
  for (const field of Object.keys(vacancyOptions) as VacancyOptionField[]) {
    values[field] = normalizeVacancyOption(field, values[field])
  }
  values.salary = formatVacancySalary(values.salary)
  return values
}

export function VacancyFormDialog({
  vacancy,
  onClose,
  onSave,
}: VacancyFormDialogProps) {
  const [values, setValues] = useState(() => getInitialForm(vacancy))
  const [requestId] = useState(() => crypto.randomUUID())
  const [step, setStep] = useState<VacancyFormStep>(0)
  const [touched, setTouched] = useState<
    Partial<Record<keyof VacancyFormValues, boolean>>
  >({})
  const [attemptedSteps, setAttemptedSteps] = useState<
    ReadonlySet<VacancyFormStep>
  >(() => new Set())
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const stepHeadingRef = useRef<HTMLHeadingElement>(null)
  const stepFieldsRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)
  const isEditing = vacancy !== null
  const today = getBusinessDate()
  const minimumDeadline =
    vacancy && vacancy.deadline < today ? vacancy.deadline : today
  const errors = validateVacancyForm(values, minimumDeadline)
  const visibleErrors = Object.fromEntries(
    vacancyFormSteps[step].fields
      .filter(
        (field) => (touched[field] || attemptedSteps.has(step)) && errors[field]
      )
      .map((field) => [field, errors[field]])
  ) as VacancyFormErrors

  useEffect(() => {
    stepFieldsRef.current?.scrollTo({ top: 0 })
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    stepHeadingRef.current?.focus()
  }, [step])

  function updateField<Key extends keyof VacancyFormValues>(
    field: Key,
    value: VacancyFormValues[Key]
  ) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function handleBlur(field: VacancyTextField) {
    setValues((current) => ({
      ...current,
      [field]: normalizeVacancyField(field, current[field]),
    }))
    setTouched((current) => ({ ...current, [field]: true }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    const normalizedValues = normalizeVacancyForm(values)
    const nextErrors = validateVacancyForm(normalizedValues, minimumDeadline)
    setValues(normalizedValues)
    setAttemptedSteps((current) => new Set(current).add(step))

    const currentStepError = vacancyFormSteps[step].fields.find(
      (field) => nextErrors[field]
    )
    if (currentStepError) {
      document.getElementById(getVacancyFieldId(currentStepError))?.focus()
      return
    }

    if (step < vacancyFormSteps.length - 1) {
      setStep((step + 1) as VacancyFormStep)
      return
    }

    const firstInvalidField = vacancyFieldOrder.find(
      (field) => nextErrors[field]
    )
    if (firstInvalidField) {
      const targetStep = getFieldStep(firstInvalidField)
      setAttemptedSteps((current) => new Set(current).add(targetStep))
      setStep(targetStep)
      requestAnimationFrame(() => {
        document.getElementById(getVacancyFieldId(firstInvalidField))?.focus()
      })
      return
    }

    setSaving(true)
    setSaveError("")
    try {
      await onSave(normalizedValues, requestId)
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la vacante. Inténtalo de nuevo."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="vacancy-dialog-content" showCloseButton>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar vacante" : "Nueva vacante"}
          </DialogTitle>
          <DialogDescription>
            Completa los datos para gestionar esta oportunidad.
          </DialogDescription>
        </DialogHeader>

        <form className="vacancy-form" noValidate onSubmit={handleSubmit}>
          <div className="vacancy-step-header">
            <p className="vacancy-step-count">
              Paso {step + 1} de {vacancyFormSteps.length}
            </p>
            <h2
              className="vacancy-step-title"
              id="vacancy-step-title"
              ref={stepHeadingRef}
              tabIndex={-1}
            >
              {vacancyFormSteps[step].title}
            </h2>
            <ol
              aria-label="Progreso del formulario"
              className="vacancy-step-progress"
            >
              {vacancyFormSteps.map((item, index) => (
                <li
                  aria-current={index === step ? "step" : undefined}
                  aria-label={`Paso ${index + 1}: ${item.title}`}
                  className={
                    index <= step ? "vacancy-step-progress-active" : undefined
                  }
                  key={item.title}
                />
              ))}
            </ol>
          </div>

          <div
            aria-labelledby="vacancy-step-title"
            className="vacancy-step-fields"
            ref={stepFieldsRef}
            role="group"
          >
            {step < 2 ? (
              <VacancyGeneralFields
                errors={visibleErrors}
                minimumDeadline={minimumDeadline}
                onBlur={handleBlur}
                onChange={updateField}
                onDeadlineBlur={() =>
                  setTouched((current) => ({ ...current, deadline: true }))
                }
                section={step === 0 ? "identity" : "conditions"}
                values={values}
              />
            ) : step === 2 ? (
              <VacancyRequirementsFields
                errors={visibleErrors}
                onBlur={handleBlur}
                onChange={updateField}
                values={values}
              />
            ) : (
              <VacancyDetailsFields
                errors={visibleErrors}
                onBlur={handleBlur}
                onChange={updateField}
                section={step === 3 ? "work" : "compensation"}
                values={values}
              />
            )}
          </div>

          {saveError && (
            <p className="vacancy-form-save-error" role="alert">
              {saveError}
            </p>
          )}
          <DialogFooter className="vacancy-form-footer">
            {step > 0 && (
              <Button
                disabled={saving}
                onClick={() => setStep((step - 1) as VacancyFormStep)}
                type="button"
                variant="outline"
              >
                Anterior
              </Button>
            )}
            <Button aria-busy={saving} disabled={saving} type="submit">
              {saving && <Spinner aria-hidden="true" />}
              {step === vacancyFormSteps.length - 1
                ? isEditing
                  ? "Guardar cambios"
                  : "Crear vacante"
                : "Siguiente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
