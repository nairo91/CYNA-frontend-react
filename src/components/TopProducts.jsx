import { Link } from 'react-router-dom'
import { siteText } from '../content/siteText'
import { resolveMediaUrl } from '../utils/media'
import { ResourceState } from './ResourceState'
import { SectionHeading } from './SectionHeading'

function formatPrice(price) {
  if (price === null || price === undefined || price === '') {
    return siteText.home.products.fallbackPrice
  }

  const numericPrice = Number(price)

  if (Number.isNaN(numericPrice)) {
    return price
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(numericPrice)
}

export function TopProducts({ products, isLoading, error }) {
  const section = siteText.home.products

  return (
    <section className="py-16 bg-base-200" id="featured">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="Selection du moment"
          title={section.title}
          copy={section.copy}
          meta={<Link to="/products" className="btn btn-ghost btn-sm gap-2">{section.meta} <span className="material-symbols-outlined text-sm">arrow_forward</span></Link>}
        />

        <ResourceState
          isLoading={isLoading}
          error={error}
          skeletonCount={4}
          loadingClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          errorMessage={section.error}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <article className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-200 hover:-translate-y-2 hover:border-primary/30 group" key={product.id ?? product.slug}>
                <Link className="flex flex-col h-full" to="/products">
                  <figure className="relative h-56 overflow-hidden bg-base-100 p-6 flex items-center justify-center border-b border-base-200">
                    <img
                      src={resolveMediaUrl(product.image, product.name)}
                      alt={`Illustration du produit ${product.name}`}
                      loading="lazy"
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-lg"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="badge badge-accent badge-sm font-semibold shadow-sm">{product.category?.name ?? section.fallbackCategory}</span>
                    </div>
                  </figure>
                  <div className="card-body p-6">
                    <h3 className="card-title text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors leading-tight mb-2">{product.name}</h3>
                    <p className="text-sm text-base-content/70 line-clamp-3 mb-4 flex-grow">{product.description}</p>
                    <div className="card-actions justify-between items-end mt-auto pt-4 border-t border-base-200/50">
                      <div className="text-2xl font-black text-primary">{formatPrice(product.price)}</div>
                      <div className="badge badge-ghost text-xs opacity-70">{section.status}</div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </ResourceState>
      </div>
    </section>
  )
}
