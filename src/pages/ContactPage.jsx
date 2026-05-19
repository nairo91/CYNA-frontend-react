import { useState } from 'react'
import { sendContactMessage } from '../api/contactApi'
import { siteText } from '../content/siteText'
import { useAuth } from '../context/AuthContext'
import { isValidEmail } from '../utils/authValidation'

export function ContactPage() {
  const text = siteText.pages.contact
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
    setForm((f) => ({ ...f, [name]: value }))
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
    <section className="section">
      <div className="container">
        <header className="section-heading">
          <span className="eyebrow">{text.eyebrow}</span>
          <h1 className="section-title">{text.title}</h1>
          <p className="section-copy">{text.copy}</p>
        </header>

        {status === 'done' ? (
          <div className="auth-feedback auth-feedback-success">{text.success}</div>
        ) : (
          <form id="contact-form" className="auth-form contact-form" onSubmit={handleSubmit}>
            <div className="auth-form-grid">
              <label className="auth-field">
                <span>{text.nameLabel}</span>
                <input name="name" required value={form.name} onChange={handleChange} />
              </label>
              <label className="auth-field">
                <span>{text.emailLabel}</span>
                <input type="email" name="email" required value={form.email} onChange={handleChange} />
              </label>
            </div>
            <label className="auth-field">
              <span>{text.subjectLabel}</span>
              <input name="subject" required value={form.subject} onChange={handleChange} />
            </label>
            <label className="auth-field">
              <span>{text.messageLabel}</span>
              <textarea name="message" rows={6} required value={form.message} onChange={handleChange} />
            </label>
            {errorMessage ? <div className="auth-feedback auth-feedback-error">{errorMessage}</div> : null}
            <button type="submit" className="button-primary auth-submit" disabled={status === 'submitting'}>
              {status === 'submitting' ? text.submitting : text.submit}
            </button>
          </form>
        )}

        {text.teamMembers && text.teamMembers.length > 0 ? (
          <div className="contact-team" style={{ marginTop: '2rem' }}>
            <h2>{text.teamTitle}</h2>
            <p>{text.teamCopy}</p>
            <ul>
              {text.teamMembers.map((member) => (
                <li key={member}>{member}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  )
}
