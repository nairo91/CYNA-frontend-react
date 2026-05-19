import { Link } from 'react-router-dom'
import { siteText } from '../content/siteText'
import { resolveMediaUrl } from '../utils/media'
import { ResourceState } from './ResourceState'
import { SectionHeading } from './SectionHeading'

export function CategoriesGrid({ categories, isLoading, error }) {
  const section = siteText.home.categories

  return (
    <section className="py-16 bg-base-100" id="categories">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="Catalogue CYNA"
          title={section.title}
          copy={section.copy}
          meta={<Link to="/categories" className="btn btn-ghost btn-sm gap-2">{section.meta} <span className="material-symbols-outlined text-sm">arrow_forward</span></Link>}
        />

        <ResourceState
          isLoading={isLoading}
          error={error}
          skeletonCount={6}
          loadingClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          errorMessage={section.error}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <article className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-300 hover:border-primary/50 group" key={category.id ?? category.slug}>
                <Link className="flex flex-col h-full" to="/categories">
                  <figure className="relative h-48 overflow-hidden bg-base-300">
                    <img
                      src={resolveMediaUrl(category.image, category.name)}
                      alt={`Illustration de la categorie ${category.name}`}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="badge badge-secondary shadow-md font-medium">{section.chip}</span>
                    </div>
                  </figure>
                  <div className="card-body p-6">
                    <h3 className="card-title text-xl text-base-content group-hover:text-primary transition-colors mb-2">{category.name}</h3>
                    <p className="text-base-content/70 flex-grow text-sm leading-relaxed">{category.description ?? section.fallbackDescription}</p>
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
