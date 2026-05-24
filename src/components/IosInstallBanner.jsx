/* eslint-disable react/prop-types */
import { X } from 'lucide-react'

export function IosInstallBanner({ onDismiss }) {
  return (
    <section
      aria-label="Installer CYNA sur iPhone"
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:px-4 lg:bottom-6 lg:px-6"
    >
      <div className="mx-auto flex w-full max-w-[var(--page-max-width)] flex-col gap-4 rounded-2xl border border-primary/25 bg-card/95 p-4 shadow-2xl shadow-black/20 backdrop-blur sm:flex-row sm:items-start sm:justify-between lg:max-w-4xl lg:p-5">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Installation rapide
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground sm:text-base">
            Pour installer CYNA comme une application native sur votre iPhone : cliquez sur le
            bouton Partager (ic&ocirc;ne carr&eacute; avec une fl&egrave;che vers le haut ou les
            trois points d&apos;options de votre navigateur), puis faites d&eacute;filer et
            s&eacute;lectionnez Sur l&apos;&eacute;cran d&apos;accueil (+).
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Masquer la banniere d'installation"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center self-end rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-9 sm:w-9 sm:self-start"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
