import { Link } from 'react-router-dom'
import { siteText } from '../content/siteText'

export function AboutPage() {
  const page = siteText.pages.about

  return (
    <section className="section">
      <div className="container">
        <header className="section-heading">
          <span className="eyebrow">{page.eyebrow}</span>
          <h1 className="section-title">{page.title}</h1>
          <p className="section-copy">{page.copy}</p>
        </header>

        <article className="panel about-block">
          <span className="eyebrow">Notre mission</span>
          <h2 className="about-block-title">{page.missionTitle}</h2>
          {page.missionParagraphs.map((paragraph, index) => (
            <p className="section-copy" key={index}>
              {paragraph}
            </p>
          ))}

          <div className="about-stats">
            {page.stats.map((stat) => (
              <div className="about-stat" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel about-block">
          <span className="eyebrow">Valeurs</span>
          <h2 className="about-block-title">{page.valuesTitle}</h2>
          <div className="about-values">
            {page.values.map((value) => (
              <div className="about-value-card" key={value.title}>
                <strong>{value.title}</strong>
                <p className="section-copy">{value.copy}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel about-block about-cta">
          <span className="eyebrow">Contact</span>
          <h2 className="about-block-title">{page.ctaTitle}</h2>
          <p className="section-copy">{page.ctaCopy}</p>
          <div className="hero-actions">
            <Link className="button-primary" to="/contact">
              {page.ctaPrimary}
            </Link>
            <Link className="button-secondary" to="/products">
              {page.ctaSecondary}
            </Link>
          </div>
        </article>
      </div>
    </section>
  )
}
