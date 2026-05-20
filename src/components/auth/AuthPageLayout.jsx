/* eslint-disable react/prop-types */
import { Link } from 'react-router-dom'
import { Check, Shield } from 'lucide-react'

export function AuthPageLayout({
  eyebrow,
  title,
  copy,
  benefits,
  cardTitle,
  cardCopy,
  footerPrompt,
  footerActionLabel,
  footerActionTo,
  children,
}) {
  return (
    <section className="min-h-[calc(100vh-4rem)] bg-background py-12 lg:py-20">
      <div className="mx-auto w-full max-w-[var(--page-max-width)] px-4 lg:px-6">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-16">
          <aside className="flex flex-col">
            <Link
              to="/"
              className="inline-flex w-fit items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="CYNA, retour à l'accueil"
            >
              <Shield className="h-7 w-7 text-primary" aria-hidden="true" />
              <span className="text-xl font-semibold tracking-tight text-foreground">
                CYNA
              </span>
            </Link>

            <span className="mt-8 inline-flex w-fit items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground lg:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground lg:text-lg">
              {copy}
            </p>

            {benefits?.length ? (
              <ul className="mt-8 space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-foreground/80">
                    <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </aside>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {cardTitle}
              </h2>
              {cardCopy ? (
                <p className="mt-2 text-sm text-muted-foreground">{cardCopy}</p>
              ) : null}
            </div>

            {children}

            <div className="mt-6 border-t border-border pt-4 text-center text-sm text-muted-foreground">
              {footerPrompt}{' '}
              <Link
                to={footerActionTo}
                className="font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:underline"
              >
                {footerActionLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
