import { siteText } from '../content/siteText'

export function CGUPage() {
  const page = siteText.pages.cgu

  return (
    <section className="section">
      <div className="container">
        <header className="section-heading">
          <span className="eyebrow">{page.eyebrow}</span>
          <h1 className="section-title">{page.title}</h1>
          <p className="section-copy">{page.copy}</p>
          <p className="section-copy legal-meta">{page.lastUpdate}</p>
        </header>

        <div className="legal-content">
          {page.articles.map((article) => (
            <article className="panel legal-article" key={article.number}>
              <span className="eyebrow legal-article-eyebrow">{article.number}</span>
              <h2 className="legal-article-title">{article.title}</h2>
              {article.paragraphs.map((paragraph, index) => (
                <p className="section-copy" key={index}>
                  {paragraph}
                </p>
              ))}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
