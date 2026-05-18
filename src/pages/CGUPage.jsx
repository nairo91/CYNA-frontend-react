import { siteText } from '../content/siteText'

export function CGUPage() {
  const text = siteText.pages.cgu

  return (
    <section className="section">
      <div className="container">
        <header className="section-heading">
          <span className="eyebrow">{text.eyebrow}</span>
          <h1 className="section-title">{text.title}</h1>
          <p className="section-copy">{text.copy}</p>
        </header>

        {text.articles.map((article) => (
          <div key={article.id} className="panel">
            <h2>{article.title}</h2>
            <p className="section-copy">{article.content}</p>
          </div>
        ))}

        <p className="section-copy">{text.updated}</p>
      </div>
    </section>
  )
}
