/* eslint-disable react/prop-types */
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { resolveMediaUrl } from '../utils/media'
import { ResourceState } from './ResourceState'
import { SectionHeading } from './SectionHeading'

export function CategoriesGrid({ categories, isLoading, error }) {
  const { t } = useTranslation('home')

  return (
    <section className="bg-background py-16 lg:py-20" id="categories">
      <div className="mx-auto w-full max-w-[var(--page-max-width)] px-4 lg:px-6">
        <SectionHeading
          eyebrow={t('categories.eyebrow')}
          title={t('categories.title')}
          copy={t('categories.copy')}
          meta={
            <Link
              to="/categories"
              className="group inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {t('categories.meta')}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          }
        />

        <ResourceState
          isLoading={isLoading}
          error={error}
          skeletonCount={6}
          loadingClassName="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
          errorMessage={t('categories.error')}
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
                      <h3 className="text-lg font-semibold tracking-tight text-white drop-shadow-sm lg:text-xl">
                        {category.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        {t('categories.chip')}
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </span>
                    </figcaption>
                  </figure>
                  <div className="p-5">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {category.description ?? t('categories.fallbackDescription')}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </ResourceState>
      </div>
    </section>
  )
}
