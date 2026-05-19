import { Link } from 'react-router-dom'
import { siteText } from '../content/siteText'

function renderLegal(link) {
  if (link.to) {
    return (
      <Link to={link.to} key={link.label} className="link link-hover">
        {link.label}
      </Link>
    )
  }
  return (
    <a href={link.href} key={link.label} className="link link-hover">
      {link.label}
    </a>
  )
}

export function Footer() {
  const footer = siteText.footer
  const year = new Date().getFullYear()
  const copyright = (footer.copyright ?? '').replace('{year}', year)

  return (
    <footer className="bg-base-300 text-base-content mt-auto" id="footer-contact">
      <div className="footer p-10 container mx-auto text-base-content">
        <aside className="max-w-sm">
          <span className="material-symbols-outlined text-4xl text-primary mb-2">security</span>
          <p className="font-bold text-xl">{footer.title}</p>
          <p className="mt-2 text-base-content/70 leading-relaxed">{footer.copy}</p>
        </aside> 
        
        <nav>
          <h6 className="footer-title">{footer.legalTitle}</h6> 
          <div className="flex flex-col gap-2">
            {footer.legalLinks.map(renderLegal)}
          </div>
        </nav> 
        
        <nav>
          <h6 className="footer-title">Contact</h6> 
          <div className="flex flex-col gap-2">
            <Link to="/contact" className="link link-hover flex items-center gap-2"><span className="material-symbols-outlined text-sm">mail</span> Formulaire de contact</Link>
            <a href="mailto:contact@cyna-it.fr" className="link link-hover flex items-center gap-2"><span className="material-symbols-outlined text-sm">alternate_email</span> contact@cyna-it.fr</a>
            <a href="tel:+33180000000" className="link link-hover flex items-center gap-2"><span className="material-symbols-outlined text-sm">phone</span> 01 80 00 00 00</a>
          </div>
        </nav> 
        
        <nav>
          <h6 className="footer-title">{footer.followTitle}</h6> 
          <div className="flex gap-4 mt-2">
            {footer.followLinks.map((link) => (
              <a href={link.href} key={link.label} className="btn btn-ghost btn-circle btn-sm">
                <span className="sr-only">{link.label}</span>
                <span className="material-symbols-outlined">link</span>
              </a>
            ))}
          </div>
        </nav>
      </div>
      <div className="footer footer-center p-4 bg-base-300 border-t border-base-200 text-base-content/60">
        <aside>
          <p>{copyright}</p>
        </aside>
      </div>
    </footer>
  )
}
