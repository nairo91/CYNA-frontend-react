import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone, Shield, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/* Brand icons inlined: lucide v1.x removed branded icons (LinkedIn / GitHub /
   YouTube / Twitter) for trademark reasons. Stroke paths kept faithful to the
   original lucide 0.x set so the visual rhythm matches the rest of the UI. */

function LinkedinIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function YoutubeIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  )
}

function GithubIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

function XIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

const SOCIAL_ICON_MAP = {
  LinkedIn: LinkedinIcon,
  YouTube: YoutubeIcon,
  Youtube: YoutubeIcon,
  X: XIcon,
  'Twitter / X': XIcon,
  Twitter: XIcon,
  GitHub: GithubIcon,
}

function getSocialIcon(label) {
  return SOCIAL_ICON_MAP[label] ?? Mail
}

const FOOTER_LINK_CLASSES =
  'rounded-sm text-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function Footer() {
  const { t } = useTranslation('common')
  const year = new Date().getFullYear()
  const socialLinks = t('footer.socialLinks', { returnObjects: true }).filter(
    (link) => link.href && link.href !== '#'
  )
  const contactInfo = t('footer.contactInfo', { returnObjects: true })

  return (
    <footer id="footer" className="mt-auto border-t border-border bg-card text-card-foreground">
      <div className="mx-auto w-full max-w-[var(--page-max-width)] px-5 py-12 lg:px-6 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))] lg:gap-12">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              aria-label={t('footer.brandHome')}
            >
              <Shield className="h-6 w-6 text-primary" aria-hidden="true" />
              <span className="text-lg font-semibold tracking-tight text-foreground">
                {t('footer.title')}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t('footer.copy')}
            </p>
            {socialLinks.length > 0 ? (
              <ul
                className="mt-6 flex flex-wrap gap-2"
                aria-label={t('footer.followAriaLabel')}
              >
                {socialLinks.map((link) => {
                  const Icon = getSocialIcon(link.label)
                  return (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-ring hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">{link.label}</span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </div>

          <nav aria-label={t('footer.solutionsTitle')}>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('footer.solutionsTitle')}
            </h2>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/products" className={FOOTER_LINK_CLASSES}>
                  {t('footer.links.allProducts')}
                </Link>
              </li>
              <li>
                <Link to="/categories" className={FOOTER_LINK_CLASSES}>
                  {t('footer.links.categories')}
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label={t('footer.companyTitle')}>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('footer.companyTitle')}
            </h2>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/a-propos" className={FOOTER_LINK_CLASSES}>
                  {t('footer.links.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className={FOOTER_LINK_CLASSES}>
                  {t('footer.links.contact')}
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label={t('footer.legalTitle')}>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('footer.legalTitle')}
            </h2>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/mentions-legales" className={FOOTER_LINK_CLASSES}>
                  {t('footer.links.legalNotice')}
                </Link>
              </li>
              <li>
                <Link to="/cgu" className={FOOTER_LINK_CLASSES}>
                  {t('footer.links.cgu')}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 grid gap-6 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href={`mailto:${contactInfo.email}`}
            className="group inline-flex items-center gap-3 rounded-sm text-sm text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Mail
              className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary"
              aria-hidden="true"
            />
            <span>{contactInfo.email}</span>
          </a>
          <a
            href={`tel:${contactInfo.phoneTel}`}
            className="group inline-flex items-center gap-3 rounded-sm text-sm text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Phone
              className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary"
              aria-hidden="true"
            />
            <span className="font-mono tabular-nums">{contactInfo.phone}</span>
          </a>
          <div className="inline-flex items-center gap-3 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            <span>{contactInfo.address}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-6">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary/80" aria-hidden="true" />
            {t('footer.trust.gdpr')}
          </span>
          <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary/80" aria-hidden="true" />
            {t('footer.trust.pci')}
          </span>
          <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary/80" aria-hidden="true" />
            {t('footer.trust.hosting')}
          </span>
        </div>
      </div>

      <div className="border-t border-border bg-background/40">
        <div className="mx-auto w-full max-w-[var(--page-max-width)] px-5 py-4 lg:px-6">
          <p className="text-center text-xs text-muted-foreground sm:text-start">
            {t('footer.copyright', { year })}
          </p>
        </div>
      </div>
    </footer>
  )
}
