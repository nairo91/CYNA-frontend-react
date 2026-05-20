import { ArrowUpRight, Compass, Layers } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const POINT_ICONS = [Compass, Layers, ArrowUpRight]

export function Hero() {
  const { t } = useTranslation('home')
  const points = t('intro.points', { returnObjects: true })

  return (
    <section
      className="border-y border-border bg-card py-16 lg:py-20"
      aria-labelledby="intro-title"
    >
      <div className="mx-auto w-full max-w-[var(--page-max-width)] px-4 lg:px-6">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('intro.eyebrow')}
          </span>
          <h2
            id="intro-title"
            className="mt-4 text-3xl font-semibold tracking-tight text-foreground lg:text-4xl"
          >
            {t('intro.title')}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground lg:text-lg">
            {t('intro.copy')}
          </p>
        </div>

        <ul
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-6"
          aria-label={t('intro.pointsAriaLabel')}
        >
          {points.map((point, index) => {
            const Icon = POINT_ICONS[index] ?? Compass
            return (
              <li
                key={point.title}
                className="group rounded-2xl border border-border bg-background p-6 transition-colors duration-200 hover:border-primary/40"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {point.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {point.copy}
                </p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
