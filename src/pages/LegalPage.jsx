import { siteText } from '../content/siteText'

export function LegalPage() {
  const page = siteText.pages.legal

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
          {page.sections.map((section) => (
            <article className="panel legal-article" key={section.title}>
              <h2 className="legal-article-title">{section.title}</h2>

              {section.items ? (
                <dl className="legal-info-list">
                  {section.items.map((item) => (
                    <div className="legal-info-row" key={item.label}>
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {section.paragraphs
                ? section.paragraphs.map((paragraph, index) => (
                    <p className="section-copy" key={index}>
                      {paragraph}
                    </p>
                  ))
                : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
