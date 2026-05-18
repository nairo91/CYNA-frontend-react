import { siteText } from '../content/siteText'

export function AboutPage() {
  const text = siteText.pages.about

  return (
    <section className="section">
      <div className="container">
        <header className="section-heading">
          <span className="eyebrow">{text.eyebrow}</span>
          <h1 className="section-title">{text.title}</h1>
          <p className="section-copy">{text.copy}</p>
        </header>

        <div className="panel">
          <h2>{text.missionTitle}</h2>
          <p className="section-copy">{text.missionCopy}</p>
        </div>

        <div className="panel">
          <h2>{text.valuesTitle}</h2>
          {text.values.map((v) => (
            <p key={v.title} className="section-copy">
              <strong>{v.title}</strong> — {v.copy}
            </p>
          ))}
        </div>

        <div className="panel">
          <h2>{text.teamTitle}</h2>
          {text.team.map((member) => (
            <div key={member.name}>
              <p>
                <strong>{member.name}</strong> — {member.role}
              </p>
              <p className="section-copy">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
