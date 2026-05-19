import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { siteText } from '../content/siteText'

export function NotFoundPage() {
  const page = siteText.pages.notFound

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center px-4 py-12">
      <div className="w-full rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Compass className="h-6 w-6" aria-hidden="true" />
        </div>
        <span className="mt-4 inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {page.eyebrow}
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          {page.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{page.copy}</p>
        <Link
          to="/"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          {page.cta}
        </Link>
      </div>
    </div>
  )
}
