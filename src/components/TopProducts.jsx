/* eslint-disable react/prop-types */
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { siteText } from '../content/siteText'
import { resolveMediaUrl } from '../utils/media'
import { ResourceState } from './ResourceState'
import { SectionHeading } from './SectionHeading'

function formatPrice(price) {
  if (price === null || price === undefined || price === '') {
    return siteText.home.products.fallbackPrice
  }
  const numeric = Number(price)
  if (Number.isNaN(numeric)) return price
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(numeric)
}

export function TopProducts({ products, isLoading, error }) {
  const section = siteText.home.products

  return (
    <section className="bg-card py-16 lg:py-20" id="featured">
      <div className="mx-auto w-full max-w-[var(--page-max-width)] px-4 lg:px-6">
        <SectionHeading
          eyebrow="Sélection du moment"
          title={section.title}
          copy={section.copy}
          meta={
            <Link
              to="/products"
              className="group inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              {section.meta}
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
          skeletonCount={4}
          loadingClassName="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
          errorMessage={section.error}
        >
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {products.map((product) => (
              <li key={product.id ?? product.slug}>
                <Link
                  to={`/products/${product.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                >
                  <figure className="relative aspect-[4/3] overflow-hidden bg-card">
                    <img
                      src={resolveMediaUrl(product.image, product.name)}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105"
                    />
                    <span className="absolute start-3 top-3 inline-flex items-center rounded-full border border-border bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                      {product.category?.name ?? section.fallbackCategory}
                    </span>
                  </figure>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="line-clamp-2 text-base font-semibold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary">
                      {product.name}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {product.description}
                    </p>
                    <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                      <div className="font-mono text-lg font-semibold tracking-tight tabular-nums text-primary">
                        {formatPrice(product.price)}
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <Sparkles className="h-3 w-3" aria-hidden="true" />
                        {section.status}
                      </span>
                    </div>
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
