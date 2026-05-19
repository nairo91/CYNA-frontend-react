import { Link } from 'react-router-dom'
import { siteText } from '../content/siteText'

function renderLegal(link) {
  if (link.to) {
    return (
      <Link to={link.to} key={link.label}>
        {link.label}
      </Link>
    )
  }
  return (
    <a href={link.href} key={link.label}>
      {link.label}
    </a>
  )
}

export function Footer() {
  const footer = siteText.footer
  const year = new Date().getFullYear()
  const copyright = (footer.copyright ?? '').replace('{year}', year)

  return (
    <footer className="footer" id="footer-contact">
      <div className="container footer-inner">
        <div className="footer-brand" id="footer-about">
          <strong>{footer.title}</strong>
          <p className="section-copy footer-copy">{footer.copy}</p>
        </div>

        <div className="footer-group" id="footer-legal">
          <strong>{footer.legalTitle}</strong>
          <div className="footer-links">
            {footer.legalLinks.map(renderLegal)}
          </div>
        </div>

        <div className="footer-group">
          <strong>Contact</strong>
          <div className="footer-links">
            <Link to="/contact">Formulaire de contact</Link>
            <a href="mailto:contact@cyna-it.fr">contact@cyna-it.fr</a>
            <a href="tel:+33180000000">01 80 00 00 00</a>
          </div>
        </div>

        <div className="footer-group">
          <strong>{footer.followTitle}</strong>
          <div className="footer-links">
            {footer.followLinks.map((link) => (
              <a href={link.href} key={link.label}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="container footer-bottom">{copyright}</div>
    </footer>
  )
}
