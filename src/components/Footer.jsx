import { Link } from 'react-router-dom'
import { siteText } from '../content/siteText'

export function Footer() {
  const { footer } = siteText

  return (
    <footer className="footer" id="footer-contact">
      <div className="container footer-inner">
        <div className="footer-brand" id="footer-about">
          <strong>{footer.title}</strong>
          <p className="section-copy footer-copy">{footer.copy}</p>
        </div>

        <div className="footer-group">
          <strong>{footer.informationsTitle}</strong>
          <div className="footer-links">
            <Link to="/">Accueil</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/products">Produits</Link>
          </div>
        </div>

        <div className="footer-group">
          <strong>{footer.contactTitle}</strong>
          <div className="footer-links">
            <Link to="/contact">Formulaire de contact</Link>
            <a href={`mailto:${footer.contactEmail}`}>{footer.contactEmail}</a>
            <a href={`tel:${footer.contactPhone.replace(/\s+/g, '')}`}>{footer.contactPhone}</a>
          </div>
        </div>

        <div className="footer-group" id="footer-legal">
          <strong>{footer.legalLinksTitle}</strong>
          <div className="footer-links">
            {footer.legalLinks.map((link) => (
              <Link to={link.to} key={link.label}>{link.label}</Link>
            ))}
          </div>
        </div>

        <div className="footer-group">
          <strong>{footer.socialLinksTitle}</strong>
          <div className="footer-links">
            {footer.socialLinks.map((link) => (
              <a
                href={link.href}
                key={link.label}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noreferrer' : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
