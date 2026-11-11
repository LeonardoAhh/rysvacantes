import { useState } from "react"
import { ArrowRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  getVacancyWhatsAppUrl,
  recruitmentPhones,
} from "@/lib/recruitment-contact"
import { WhatsAppIcon } from "@/components/profile/whatsapp-icon"
import { vacancyWhatsAppCopy } from "./vacancy-whatsapp-copy"
import type { Vacancy } from "./vacancy-types"
import "./vacancy-whatsapp-contact.css"

type VacancyWhatsAppContactProps = {
  className: string
  vacancy: Pick<Vacancy, "title">
  showArrow?: boolean
}

export function VacancyWhatsAppContact({
  className,
  vacancy,
  showArrow = false,
}: VacancyWhatsAppContactProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger
        aria-label={vacancyWhatsAppCopy.triggerAriaLabel(vacancy.title)}
        className={className}
      >
        {vacancyWhatsAppCopy.triggerLabel}
        {showArrow && <ArrowRight aria-hidden="true" />}
      </DialogTrigger>
      <VacancyWhatsAppDialogContent
        onSelectContact={() => setOpen(false)}
        vacancy={vacancy}
      />
    </Dialog>
  )
}

type VacancyWhatsAppDialogProps = {
  onOpenChange: (open: boolean) => void
  open: boolean
  vacancy: Pick<Vacancy, "title">
}

export function VacancyWhatsAppDialog({
  onOpenChange,
  open,
  vacancy,
}: VacancyWhatsAppDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <VacancyWhatsAppDialogContent
        onSelectContact={() => onOpenChange(false)}
        vacancy={vacancy}
      />
    </Dialog>
  )
}

type VacancyWhatsAppContactTriggerProps = {
  className: string
  onClick: () => void
  showArrow?: boolean
  vacancy: Pick<Vacancy, "title">
}

export function VacancyWhatsAppContactTrigger({
  className,
  onClick,
  showArrow = false,
  vacancy,
}: VacancyWhatsAppContactTriggerProps) {
  return (
    <button
      aria-label={vacancyWhatsAppCopy.triggerAriaLabel(vacancy.title)}
      className={className}
      onClick={onClick}
      type="button"
    >
      {vacancyWhatsAppCopy.triggerLabel}
      {showArrow && <ArrowRight aria-hidden="true" />}
    </button>
  )
}

function VacancyWhatsAppDialogContent({
  onSelectContact,
  vacancy,
}: {
  onSelectContact: () => void
  vacancy: Pick<Vacancy, "title">
}) {
  return (
    <DialogContent className="vacancy-whatsapp-dialog">
      <DialogHeader className="vacancy-whatsapp-dialog-header">
        <DialogTitle>{vacancyWhatsAppCopy.dialogTitle}</DialogTitle>
        <DialogDescription>
          {vacancyWhatsAppCopy.dialogDescription}
        </DialogDescription>
      </DialogHeader>
      <div className="vacancy-whatsapp-options">
        {recruitmentPhones.map(({ number, whatsapp }) => (
          <a
            aria-label={vacancyWhatsAppCopy.contactAriaLabel(number)}
            href={getVacancyWhatsAppUrl(vacancy, whatsapp)}
            key={whatsapp}
            onClick={onSelectContact}
            rel="noopener noreferrer"
            target="_blank"
          >
            <WhatsAppIcon className="vacancy-whatsapp-option-icon" />
            <span className="vacancy-whatsapp-option-copy">
              <span className="vacancy-whatsapp-option-label">
                {vacancyWhatsAppCopy.contactLabel}
              </span>
              <span>{number}</span>
            </span>
            <ArrowRight aria-hidden="true" />
          </a>
        ))}
        <aside aria-hidden="true" className="vacancy-whatsapp-preview">
          <WhatsAppIcon className="vacancy-whatsapp-option-icon" />
          <span className="vacancy-whatsapp-option-copy">
            <span className="vacancy-whatsapp-option-label">
              {vacancyWhatsAppCopy.contactLabel}
            </span>
            <Skeleton className="vacancy-whatsapp-preview-line" />
            <Skeleton className="vacancy-whatsapp-preview-line vacancy-whatsapp-preview-line-short" />
          </span>
        </aside>
      </div>
    </DialogContent>
  )
}
