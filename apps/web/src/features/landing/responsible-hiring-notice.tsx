import { useRef, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import "./responsible-hiring-notice.css"

const commitments = [
  {
    title: "Verificamos tu edad",
    description:
      "Las oportunidades están dirigidas a personas de 18 años o más. Durante la selección revisamos una identificación oficial vigente.",
  },
  {
    title: "Participas por decisión propia",
    description:
      "Participar en la selección y aceptar una oferta es tu decisión, sin presiones, engaños ni amenazas.",
  },
  {
    title: "Sin retención de documentos ni deudas",
    description:
      "No retenemos tus documentos personales ni imponemos deudas por reclutamiento, capacitación, uniformes o herramientas.",
  },
] as const

export function ResponsibleHiringNotice() {
  // Each visit to Inicio mounts a new notice; dismissing it is not consent.
  const [open, setOpen] = useState(true)
  const titleRef = useRef<HTMLHeadingElement>(null)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="responsible-hiring-notice"
        initialFocus={titleRef}
        finalFocus={() => document.getElementById("main-content")}
      >
        <DialogHeader>
          <p className="responsible-hiring-eyebrow">Nuestro compromiso</p>
          <DialogTitle ref={titleRef} tabIndex={-1}>
            Reclutamiento libre y seguro
          </DialogTitle>
          <DialogDescription>
            Prevenimos el trabajo forzado, el trabajo infantil y la trata de
            personas con una selección responsable.
          </DialogDescription>
        </DialogHeader>
        <ul className="responsible-hiring-commitments">
          {commitments.map(({ title, description }) => (
            <li key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ul>
        <DialogFooter>
          <DialogClose render={<Button type="button" />}>Continuar</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
