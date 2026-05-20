import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function AboutPage() {
  const { t } = useTranslation('legal')
  const page = t('about', { returnObjects: true })

  return (
    <div className="mx-auto w-full max-w-[var(--page-max-width)] px-5 py-12 lg:px-6 lg:py-16">
      <header className="mb-12 lg:mb-16">
        <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {page.eyebrow}
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground lg:text-5xl">
          {page.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground lg:text-lg">
          {page.copy}
        </p>
      </header>

      <section className="mb-8 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm lg:mb-12 lg:p-10">
        <span className="font-mono text-xs font-medium uppercase tracking-wider text-primary">
          {page.missionEyebrow}
        </span>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
          {page.missionTitle}
        </h2>
        <div className="mt-4 max-w-3xl space-y-4 text-sm leading-relaxed text-muted-foreground lg:text-base">
          {page.missionParagraphs.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {page.stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-background p-5"
            >
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </dt>
              <dd className="mt-2 font-mono text-3xl font-semibold tracking-tight text-foreground tabular-nums lg:text-4xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mb-8 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm lg:mb-12 lg:p-10">
        <span className="font-mono text-xs font-medium uppercase tracking-wider text-primary">
          {page.valuesEyebrow}
        </span>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
          {page.valuesTitle}
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {page.values.map((value) => (
            <div
              key={value.title}
              className="rounded-xl border border-border bg-background p-5"
            >
              <h3 className="text-base font-semibold text-foreground">
                {value.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {value.copy}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm lg:p-10">
        <span className="font-mono text-xs font-medium uppercase tracking-wider text-primary">
          {page.ctaEyebrow}
        </span>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
          {page.ctaTitle}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {page.ctaCopy}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/contact"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {page.ctaPrimary}
          </Link>
          <Link
            to="/products"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-transparent px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all duration-150 hover:bg-card active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {page.ctaSecondary}
          </Link>
        </div>
      </section>
    </div>
  )
}
