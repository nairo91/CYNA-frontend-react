/* eslint-disable react/prop-types, react/no-unescaped-entities */
import { X } from 'lucide-react'

export function IosInstallBanner({ onDismiss }) {
  return (
    <section
      aria-label="Installer CYNA sur iPhone"
      className="mx-auto my-6 w-full max-w-[var(--page-max-width)] px-4 lg:px-6"
    >
      <div className="flex flex-col gap-4 rounded-2xl border border-primary/25 bg-card p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between lg:p-5">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Installation rapide
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground sm:text-base">
            Pour installer CYNA comme une application native sur votre iPhone : cliquez sur le bouton
            Partager (icône carré avec une flèche vers le haut ou les trois points d'options de
            votre navigateur), puis faites défiler et sélectionnez Sur l'écran d'accueil (+).
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Masquer la bannière d'installation"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:self-start"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
