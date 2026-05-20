import { useState } from 'react'
import { AlertCircle, CheckCircle2, Send, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { sendContactMessage } from '../api/contactApi'
import { useAuth } from '../context/AuthContext'
import { isValidEmail } from '../utils/authValidation'
import { cn } from '../lib/utils'

const INPUT_CLASSES =
  'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40'

const LABEL_CLASSES =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground'

export function ContactPage() {
  const { t } = useTranslation('contact')
  const text = t('', { returnObjects: true })
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: user ? `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim() : '',
    email: user?.email ?? '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setErrorMessage(text.fieldsRequired)
      return
    }
    if (!isValidEmail(form.email)) {
      setErrorMessage(text.invalidEmail)
      return
    }

    setStatus('submitting')
    try {
      await sendContactMessage(form)
      setStatus('done')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setErrorMessage(err?.message ?? text.genericError)
      setStatus('idle')
    }
  }

  return (
    <div className="mx-auto w-full max-w-[var(--page-max-width)] px-4 py-12 lg:px-6 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-14">
        <aside className="flex flex-col">
          <span className="inline-flex w-fit items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {text.eyebrow}
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground lg:text-5xl">
            {text.title}
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground lg:text-lg">
            {text.copy}
          </p>

          {text.teamMembers && text.teamMembers.length > 0 ? (
            <section className="mt-8 rounded-2xl border border-border bg-card p-6">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                {text.teamTitle}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{text.teamCopy}</p>
              <ul className="mt-4 space-y-2">
                {text.teamMembers.map((member) => (
                  <li key={member} className="flex items-center gap-3 text-sm text-foreground/80">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-semibold text-primary">
                      {member.charAt(0)}
                    </span>
                    <span>{member}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:p-8">
          {status === 'done' ? (
            <div className="grid place-items-center gap-3 py-8 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                {text.successTitle}
              </h2>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                {text.success}
              </p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-border bg-transparent px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                {text.sendAnother}
              </button>
            </div>
          ) : (
            <form id="contact-form" onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className={LABEL_CLASSES}>
                    {text.nameLabel}
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    placeholder="Jean Dupont"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className={INPUT_CLASSES}
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className={LABEL_CLASSES}>
                    {text.emailLabel}
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    placeholder="votre@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className={INPUT_CLASSES}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className={LABEL_CLASSES}>
                  {text.subjectLabel}
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  placeholder="Demande d'informations"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className={INPUT_CLASSES}
                />
              </div>

              <div>
                <label htmlFor="contact-message" className={LABEL_CLASSES}>
                  {text.messageLabel}
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={6}
                  placeholder="Comment pouvons-nous vous aider ?"
                  value={form.message}
                  onChange={handleChange}
                  required
                  className={cn(INPUT_CLASSES, 'h-auto resize-y py-2 leading-relaxed')}
                />
              </div>

              {errorMessage ? (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <span>{errorMessage}</span>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                {status === 'submitting' ? text.submitting : text.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
