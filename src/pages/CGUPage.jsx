import { siteText } from '../content/siteText'

export function CGUPage() {
  const page = siteText.pages.cgu

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
          <nav aria-label="Sommaire" className="sticky top-24">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sommaire
            </p>
            <ol className="space-y-1">
              {page.articles.map((article, index) => (
                <li key={article.number}>
                  <a
                    href={`#article-${index + 1}`}
                    className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:bg-card focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="me-2 font-mono text-xs text-primary">
                      {article.number}
                    </span>
                    {article.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="space-y-8">
          {page.articles.map((article, index) => (
            <article
              key={article.number}
              id={`article-${index + 1}`}
              className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm lg:p-8"
            >
              <span className="font-mono text-xs font-medium uppercase tracking-wider text-primary">
                {article.number}
              </span>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground lg:text-2xl">
                {article.title}
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground lg:text-base">
                {article.paragraphs.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
