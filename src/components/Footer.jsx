import { Link } from 'react-router-dom'
import { siteText } from '../content/siteText'

function renderLegal(link) {
  if (link.to) {
    return <Link to={link.to} key={link.label}>{link.label}</Link>
  }
  return <a href={link.href} key={link.label}>{link.label}</a>
}

export function Footer() {
  return (
    <footer className="footer" id="footer-contact">
      <div className="container footer-inner">
        <div className="footer-brand" id="footer-about">
          <strong>{siteText.footer.title}</strong>
          <p className="section-copy footer-copy">{siteText.footer.copy}</p>
        </div>

        <div className="footer-group" id="footer-legal">
          <strong>Informations</strong>
          <div className="footer-links">
            <Link to="/">Accueil</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/products">Produits</Link>
            {siteText.footer.legalLinks.map(renderLegal)}
          </div>
        </div>

        <div className="footer-group">
          <strong>Contact</strong>
          <div className="footer-links">
            <Link to="/contact">Formulaire de contact</Link>
            <a href="mailto:contact@cyna.fr">contact@cyna.fr</a>
            <a href="tel:+33180000000">01 80 00 00 00</a>
          </div>
        </div>

        <div className="footer-group">
          <strong>Reseaux sociaux</strong>
          <div className="footer-links">
            {siteText.footer.socialLinks.map((link) => (
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
