import { useState } from "react"
import { ArrowRight, BadgeCheck, ClipboardList, FileText } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import "./vacancy-hiring-popover.css"

const selectionSteps = [
  { label: "Acudir a entrevista", Icon: ClipboardList },
  { label: "Entrega de documentos", Icon: FileText },
  { label: "Contratación", Icon: BadgeCheck },
] as const

const hiringDocuments = [
  "Solicitud de empleo elaborada",
  "INE",
  "Número de Seguro Social (IMSS)",
  "RFC (Constancia de Situación Fiscal)",
  "Comprobante de domicilio (no mayor a 3 meses)",
  "Acta de nacimiento",
  "Comprobante de estudios",
  "2 cartas de recomendación laborales o personales",
  "Certificado médico (de cualquier farmacia)",
  "Hoja de Retención Infonavit (en caso de tener)",
  "Copia de INE del beneficiario para apertura de tarjeta de nómina (BanBajío / BanRegio)",
  "Semanas cotizadas en el IMSS",
] as const

export function VacancyHiringPopover({
  vacancyTitle,
}: {
  vacancyTitle: string
}) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<"process" | "documents">("process")

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) setView("process")
  }

  return (
    <Popover onOpenChange={handleOpenChange} open={open}>
      <PopoverTrigger
        render={
          <Button
            aria-label={`Ver proceso de selección y documentos para ${vacancyTitle}`}
            className="public-vacancy-footer-action"
            size="default"
            type="button"
            variant="outline"
          />
        }
      >
        Proceso
        <ClipboardList aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="vacancy-hiring-popover"
        side="top"
        sideOffset={8}
      >
        <PopoverHeader>
          <PopoverTitle aria-live="polite">
            {view === "process"
              ? "Proceso de selección"
              : "Documentos para contratación"}
          </PopoverTitle>
        </PopoverHeader>

        <div className="vacancy-hiring-body">
          {view === "process" ? (
            <ol className="vacancy-hiring-steps">
              {selectionSteps.map(({ label, Icon }, index) => (
                <li key={label}>
                  <span className="vacancy-hiring-step-icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <span>
                    {index + 1}. {label}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <>
              <ul className="vacancy-hiring-documents">
                {hiringDocuments.map((document) => (
                  <li key={document}>{document}</li>
                ))}
              </ul>
              <p className="vacancy-hiring-note">
                <strong>Dato importante:</strong> Realizamos pruebas antidopaje.
              </p>
            </>
          )}
        </div>

        <div className="vacancy-hiring-actions">
          {view === "process" ? (
            <Button
              onClick={() => setView("documents")}
              size="sm"
              type="button"
            >
              Avanzar <ArrowRight aria-hidden="true" />
            </Button>
          ) : (
            <>
              <Button
                onClick={() => setView("process")}
                size="sm"
                type="button"
                variant="outline"
              >
                Volver
              </Button>
              <Button
                onClick={() => handleOpenChange(false)}
                size="sm"
                type="button"
              >
                Cerrar
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
