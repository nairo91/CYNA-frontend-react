import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
      .then((data) => { if (!cancelled) { setError(false); setCategories(data) } })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <section className="section">
      <div className="container">
        <header className="section-heading">
          <span className="eyebrow">{page.eyebrow}</span>
          <h1 className="section-title">{page.title}</h1>
          <p className="section-copy">{page.copy}</p>
        </header>

        <ResourceState
          isLoading={isLoading}
          error={error}
          skeletonCount={6}
          loadingClassName="loading-grid loading-grid-categories"
          errorMessage={page.error}
        >
          <div className="grid-categories">
            {categories.map((category) => (
              <article className="category-card" key={category.id ?? category.slug}>
                <Link className="category-card-link" to={`/products?category=${category.id}`}>
                  <div className="category-media">
                    <img
                      src={resolveMediaUrl(category.image, category.name)}
                      alt={`Illustration de la categorie ${category.name}`}
                      loading="lazy"
                    />
                  </div>
                  <div className="category-body">
                    <strong>{category.name}</strong>
                    <p className="section-copy category-copy">
                      {category.description ?? home.fallbackDescription}
                    </p>
                  </div>
                  <span className="category-chip">{home.chip}</span>
                </Link>
              </article>
            ))}
          </div>
        </ResourceState>
      </div>
    </section>
  )
}
