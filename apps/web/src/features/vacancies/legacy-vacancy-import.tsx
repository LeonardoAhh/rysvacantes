import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  markLegacyVacanciesImported,
  readLegacyVacancies,
} from "./vacancy-storage"
import { importLegacyVacancies } from "./vacancy-repository"
import "./legacy-vacancy-import.css"

export function LegacyVacancyImport({
  onImported,
}: {
  onImported: () => void
}) {
  const [legacy, setLegacy] = useState(readLegacyVacancies)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(legacy.error)

  async function handleImport() {
    if (busy) return
    setBusy(true)
    setError(null)

    try {
      await importLegacyVacancies(legacy.vacancies)
      markLegacyVacanciesImported()
      setLegacy({ vacancies: [], error: null })
      setOpen(false)
      onImported()
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudieron importar las vacantes. Inténtalo de nuevo."
      )
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  if (legacy.vacancies.length === 0 && !error) return null

  return (
    <section
      aria-label="Vacantes guardadas en este navegador"
      className="legacy-import"
    >
      {legacy.vacancies.length > 0 && (
        <>
          <p>
            Hay {legacy.vacancies.length}{" "}
            {legacy.vacancies.length === 1 ? "vacante" : "vacantes"} guardadas
            en este navegador.
          </p>
          <Button
            onClick={() => setOpen(true)}
            size="sm"
            type="button"
            variant="outline"
          >
            Importar a Supabase
          </Button>
        </>
      )}
      {error && (
        <p className="legacy-import-error" role="alert">
          {error}
        </p>
      )}

      <AlertDialog onOpenChange={setOpen} open={open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Importar vacantes locales?</AlertDialogTitle>
            <AlertDialogDescription>
              Se importarán solo las vacantes reales de este navegador. Las de
              ejemplo se excluyen y los registros existentes en Supabase no se
              sobrescriben. Si una vacante publicada tiene datos incompletos, se
              importará como borrador. El respaldo local se conservará.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={busy} onClick={handleImport}>
              {busy && <Spinner aria-hidden="true" />}
              Importar vacantes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
