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
    <section className="py-12 bg-base-100 min-h-screen flex items-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-[-10%] w-[30%] h-[30%] bg-accent/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          <aside className="lg:w-5/12 flex flex-col justify-center">
            <header className="mb-10">
              <span className="badge badge-primary badge-outline font-semibold mb-4 px-4 py-3">{text.eyebrow}</span>
              <h1 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight text-base-content">
                {text.title}
              </h1>
              <p className="text-lg text-base-content/70 leading-relaxed">
                {text.copy}
              </p>
            </header>

            {text.teamMembers && text.teamMembers.length > 0 && (
              <div className="card bg-base-200/50 backdrop-blur-md shadow-lg border border-base-300">
                <div className="card-body p-6">
                  <h2 className="card-title text-xl font-bold mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">groups</span>
                    {text.teamTitle}
                  </h2>
                  <p className="text-base-content/70 mb-4">{text.teamCopy}</p>
                  <ul className="space-y-3">
                    {text.teamMembers.map((member) => (
                      <li key={member} className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-primary/20 text-primary rounded-full w-8 h-8">
                            <span className="font-semibold text-xs">{member.charAt(0)}</span>
                          </div>
                        </div>
                        <span className="font-medium">{member}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </aside>

          <div className="lg:w-7/12">
            <div className="card bg-base-100 shadow-2xl border border-base-200 w-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
              
              <div className="card-body p-8 sm:p-10">
                {status === 'done' ? (
                  <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="material-symbols-outlined text-success text-5xl">check_circle</span>
                    </div>
                    <h3 className="text-2xl font-bold text-base-content mb-4">Message envoyé !</h3>
                    <p className="text-base-content/70 text-lg mb-8">{text.success}</p>
                    <button onClick={() => setStatus('idle')} className="btn btn-outline btn-primary">
                      Envoyer un autre message
                    </button>
                  </div>
                ) : (
                  <form id="contact-form" className="flex flex-col gap-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="form-control w-full">
                        <label className="label">
                          <span className="label-text font-medium text-base-content">{text.nameLabel}</span>
                        </label>
                        <div className="input-group relative flex items-center">
                          <span className="absolute left-3 material-symbols-outlined text-base-content/40">person</span>
                          <input 
                            name="name" 
                            placeholder="Jean Dupont"
                            className="input input-bordered w-full pl-10 focus:border-primary transition-colors bg-base-100" 
                            required 
                            value={form.name} 
                            onChange={handleChange} 
                          />
                        </div>
                      </div>
                      
                      <div className="form-control w-full">
                        <label className="label">
                          <span className="label-text font-medium text-base-content">{text.emailLabel}</span>
                        </label>
                        <div className="input-group relative flex items-center">
                          <span className="absolute left-3 material-symbols-outlined text-base-content/40">mail</span>
                          <input 
                            type="email" 
                            name="email" 
                            placeholder="votre@email.com"
                            className="input input-bordered w-full pl-10 focus:border-primary transition-colors bg-base-100" 
                            required 
                            value={form.email} 
                            onChange={handleChange} 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text font-medium text-base-content">{text.subjectLabel}</span>
                      </label>
                      <div className="input-group relative flex items-center">
                        <span className="absolute left-3 material-symbols-outlined text-base-content/40">subject</span>
                        <input 
                          name="subject" 
                          placeholder="Demande d'informations"
                          className="input input-bordered w-full pl-10 focus:border-primary transition-colors bg-base-100" 
                          required 
                          value={form.subject} 
                          onChange={handleChange} 
                        />
                      </div>
                    </div>
                    
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text font-medium text-base-content">{text.messageLabel}</span>
                      </label>
                      <textarea 
                        name="message" 
                        rows={6} 
                        placeholder="Comment pouvons-nous vous aider ?"
                        className="textarea textarea-bordered w-full text-base focus:border-primary transition-colors bg-base-100 resize-none" 
                        required 
                        value={form.message} 
                        onChange={handleChange} 
                      />
                    </div>
                    
                    {errorMessage && (
                      <div className="alert alert-error shadow-sm rounded-xl mt-2 text-sm">
                        <span className="material-symbols-outlined text-lg">error</span>
                        <span>{errorMessage}</span>
                      </div>
                    )}
                    
                    <button 
                      type="submit" 
                      className="btn btn-primary w-full shadow-md mt-4 text-lg" 
                      disabled={status === 'submitting'}
                    >
                      {status === 'submitting' ? (
                        <span className="loading loading-spinner"></span>
                      ) : (
                        <span className="material-symbols-outlined mr-2">send</span>
                      )}
                      {status === 'submitting' ? text.submitting : text.submit}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  )
}
