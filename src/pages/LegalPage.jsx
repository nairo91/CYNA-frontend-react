import { useTranslation } from 'react-i18next'

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function LegalPage() {
  const { t } = useTranslation('legal')
  const page = t('legal', { returnObjects: true })

  return (
    <div className="mx-auto w-full max-w-[var(--page-max-width)] px-5 py-12 lg:px-6 lg:py-16">
      <header className="mb-10 lg:mb-14">
        <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {page.eyebrow}
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground lg:text-5xl">
          {page.title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground lg:text-lg">
          {page.copy}
        </p>
        <p className="mt-3 font-mono text-sm font-medium text-muted-foreground tabular-nums">
          {page.lastUpdate}
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-12">
        <aside className="hidden lg:block">
          <nav aria-label={page.tocTitle} className="sticky top-24">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {page.tocTitle}
            </p>
            <ol className="space-y-1">
              {page.sections.map((section) => (
                <li key={section.title}>
                  <a
                    href={`#${slugify(section.title)}`}
                    className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:bg-card focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="space-y-8">
          {page.sections.map((section) => (
            <article
              key={section.title}
              id={slugify(section.title)}
              className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm lg:p-8"
            >
              <h2 className="text-xl font-semibold tracking-tight text-foreground lg:text-2xl">
                {section.title}
              </h2>

              {section.items ? (
                <dl className="mt-5 grid gap-3 sm:grid-cols-[10rem_1fr] sm:gap-x-6 sm:gap-y-3">
                  {section.items.map((item) => (
                    <div key={item.label} className="contents">
                      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:pt-0.5">
                        {item.label}
                      </dt>
                      <dd className="text-sm text-foreground sm:text-base">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {section.paragraphs ? (
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground lg:text-base">
                  {section.paragraphs.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
