import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { getCategories } from '../api/catalogApi'
import { ResourceState } from '../components/ResourceState'
import { siteText } from '../content/siteText'
import { resolveMediaUrl } from '../utils/media'

export function CategoriesPage() {
  const page = siteText.pages.categories
  const home = siteText.home.categories
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    getCategories()
      .then((data) => {
        if (cancelled) return
        setError(false)
        setCategories(data)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto w-full max-w-[var(--page-max-width)] px-4 py-12 lg:px-6 lg:py-16">
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
      </header>

      <ResourceState
        isLoading={isLoading}
        error={error}
        skeletonCount={6}
        loadingClassName="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
        errorMessage={page.error}
      >
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {categories.map((category) => (
            <li key={category.id ?? category.slug}>
              <Link
                to={`/products?category=${category.id}`}
                className="group block h-full overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <figure className="relative aspect-[16/10] overflow-hidden bg-background">
                  <img
                    src={resolveMediaUrl(category.image, category.name)}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                    <h2 className="text-lg font-semibold tracking-tight text-white drop-shadow-sm lg:text-xl">
                      {category.name}
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      {home.chip}
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </span>
                  </figcaption>
                </figure>
                <div className="p-5">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {category.description ?? home.fallbackDescription}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </ResourceState>
    </div>
  )
}
