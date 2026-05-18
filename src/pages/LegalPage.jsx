import { siteText } from '../content/siteText'

export function LegalPage() {
  const text = siteText.pages.legal

  return (
    <section className="section">
      <div className="container">
        <header className="section-heading">
          <span className="eyebrow">{text.eyebrow}</span>
          <h1 className="section-title">{text.title}</h1>
          <p className="section-copy">{text.copy}</p>
        </header>

        {text.sections.map((s) => (
          <div key={s.id} className="panel">
            <h2>{s.title}</h2>
            {s.lines.map((line, i) => (
              <p key={i} className="section-copy">{line}</p>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
