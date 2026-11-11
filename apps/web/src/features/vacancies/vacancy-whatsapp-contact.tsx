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
              onClick={() => setOpen(false)}
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
    </Dialog>
  )
}
