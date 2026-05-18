import { Link } from 'react-router-dom'
import { siteText } from '../content/siteText'

export function Footer() {
  return (
    <footer className="footer" id="footer-contact">
      <div className="container footer-inner">
        <div className="footer-brand" id="footer-about">
          <strong>{siteText.footer.title}</strong>
          <p className="section-copy footer-copy">{siteText.footer.copy}</p>
        </div>

        <div className="footer-group">
          <strong>Informations</strong>
          <div className="footer-links">
            <Link to="/">Accueil</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/products">Produits</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>

        <div className="footer-group" id="footer-legal">
          <strong>{siteText.footer.legalTitle}</strong>
          <div className="footer-links">
            {siteText.footer.legalLinks.map((link) => (
              <Link to={link.to} key={link.label}>{link.label}</Link>
            ))}
          </div>
        </div>

        <div className="footer-group">
          <strong>{siteText.footer.socialTitle}</strong>
          <div className="footer-links">
            {siteText.footer.socialLinks.map((link) => (
              <a href={link.href} key={link.label}>{link.label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
