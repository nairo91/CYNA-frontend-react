/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from 'react'
import { sendChatbotMessage } from '../api/chatbotApi'
import { chatbotCopy, resolveChatbotLocale } from '../i18n/chatbot'
import { isValidEmail } from '../utils/authValidation'

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

function toHistory(messages, limit = 8) {
  const history = messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .map((message) => ({
      role: message.role,
      content: message.content,
    }))

  return limit ? history.slice(-limit) : history
}

function getLastUserMessage(messages, fallback) {
  return [...messages].reverse().find((message) => message.role === 'user')?.content ?? fallback
}

function RobotIcon() {
  return (
    <svg className="chatbot-robot-icon" aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d="M12 2.5v3" />
      <path d="M7.2 7h9.6A3.2 3.2 0 0 1 20 10.2v6.1a3.2 3.2 0 0 1-3.2 3.2H7.2A3.2 3.2 0 0 1 4 16.3v-6.1A3.2 3.2 0 0 1 7.2 7Z" />
      <path d="M8.5 12h.01" />
      <path d="M15.5 12h.01" />
      <path d="M9 16h6" />
      <path d="M3 13h1" />
      <path d="M20 13h1" />
    </svg>
  )
}

export function Chatbot({ currentUser }) {
  const locale = useMemo(() => resolveChatbotLocale(), [])
  const copy = chatbotCopy[locale] ?? chatbotCopy.fr
  const messagesRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 'welcome', role: 'assistant', content: copy.welcome },
  ])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('idle')
  const [escalationAvailable, setEscalationAvailable] = useState(false)
  const [isSupportFormOpen, setIsSupportFormOpen] = useState(false)
  const [escalationError, setEscalationError] = useState('')
  const [guestContact, setGuestContact] = useState({
    fullName: '',
    email: '',
    subject: copy.subjectDefault,
  })

  useEffect(() => {
    if (!isOpen || !messagesRef.current) return
    messagesRef.current.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [isOpen, messages, escalationAvailable, isSupportFormOpen, escalationError])

  const handleGuestContactChange = (event) => {
    const { name, value } = event.target
    setGuestContact((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const content = input.trim()
    if (!content || status === 'loading') return

    const userMessage = { id: createId(), role: 'user', content }
    const nextMessages = [...messages, userMessage]

    setMessages(nextMessages)
    setInput('')
    setStatus('loading')
    setEscalationAvailable(false)
    setIsSupportFormOpen(false)
    setEscalationError('')

    try {
      const response = await sendChatbotMessage({
        message: content,
        history: toHistory(messages),
        locale,
      })

      setMessages([
        ...nextMessages,
        { id: createId(), role: 'assistant', content: response.answer },
      ])
      setEscalationAvailable(Boolean(response.shouldEscalate))
    } catch (error) {
      const fallback = error?.payload?.answer ?? copy.error
      setMessages([
        ...nextMessages,
        { id: createId(), role: 'assistant', content: fallback },
      ])
      setEscalationAvailable(true)
    } finally {
      setStatus('idle')
    }
  }

  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  const openEscalation = () => {
    setEscalationError('')

    if (!currentUser?.email) {
      setIsSupportFormOpen(true)
      return
    }

    transmitEscalation({
      fullName: `${currentUser.firstname ?? ''} ${currentUser.lastname ?? ''}`.trim(),
      email: currentUser.email,
      subject: copy.subjectDefault,
    })
  }

  const handleGuestEscalationSubmit = (event) => {
    event.preventDefault()
    setEscalationError('')

    if (!guestContact.fullName.trim() || !isValidEmail(guestContact.email)) {
      setEscalationError(copy.emailRequired)
      return
    }

    transmitEscalation({
      fullName: guestContact.fullName.trim(),
      email: guestContact.email.trim(),
      subject: guestContact.subject.trim() || copy.subjectDefault,
    })
  }

  const transmitEscalation = async ({ fullName, email, subject }) => {
    setStatus('escalating')
    try {
      const response = await sendChatbotMessage({
        message: getLastUserMessage(messages, copy.defaultEscalationMessage),
        history: toHistory(messages, null),
        locale,
        fullName,
        email,
        subject,
        escalate: true,
      })

      setMessages((current) => [
        ...current,
        { id: createId(), role: 'assistant', content: response.answer ?? copy.escalationSuccess },
      ])
      setEscalationAvailable(false)
      setIsSupportFormOpen(false)
    } catch (error) {
      setEscalationError(error?.message ?? copy.error)
    } finally {
      setStatus('idle')
    }
  }

  return (
    <div className="chatbot">
      <button
        type="button"
        className="button-secondary chatbot-toggle"
        aria-label={isOpen ? copy.close : copy.open}
        aria-expanded={isOpen}
        aria-controls="cyna-chatbot-panel"
        title={isOpen ? copy.close : copy.open}
        onClick={() => setIsOpen((current) => !current)}
      >
        <RobotIcon />
        <span className="visually-hidden">{isOpen ? copy.close : copy.open}</span>
      </button>

      {isOpen ? (
        <section id="cyna-chatbot-panel" className="chatbot-panel" aria-label={copy.title}>
          <header className="chatbot-header">
            <div>
              <h2>{copy.title}</h2>
              <p>{copy.status}</p>
            </div>
            <button
              type="button"
              className="chatbot-close-button"
              onClick={() => setIsOpen(false)}
              aria-label={copy.close}
              title={copy.close}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </header>

          <div className="chatbot-messages" role="log" aria-live="polite" ref={messagesRef}>
            {messages.map((message) => (
              <article key={message.id} className={`chatbot-message-row chatbot-message-row-${message.role}`}>
                <span className="chatbot-message-author">
                  {message.role === 'user' ? copy.userLabel : copy.assistantLabel}
                </span>
                <p className={`chatbot-message chatbot-message-${message.role}`}>
                  {message.content}
                </p>
              </article>
            ))}

            {escalationAvailable ? (
              <aside className="chatbot-escalation-offer">
                <p>{copy.escalationOffer}</p>
                {escalationError ? <div className="auth-feedback auth-feedback-error">{escalationError}</div> : null}
                <button type="button" className="chatbot-escalate" onClick={openEscalation} disabled={status === 'escalating'}>
                  {status === 'escalating' ? copy.sending : copy.escalate}
                </button>
              </aside>
            ) : null}
          </div>

          {isSupportFormOpen ? (
            <aside className="chatbot-support-popover" aria-label={copy.escalate}>
              <form className="chatbot-guest-support-form" onSubmit={handleGuestEscalationSubmit}>
                <p>{copy.escalationIntro}</p>
                <label>
                  <span>{copy.nameLabel}</span>
                  <input name="fullName" value={guestContact.fullName} onChange={handleGuestContactChange} />
                </label>
                <label>
                  <span>{copy.emailLabel}</span>
                  <input type="email" name="email" value={guestContact.email} onChange={handleGuestContactChange} />
                </label>
                <label>
                  <span>{copy.subjectLabel}</span>
                  <input name="subject" value={guestContact.subject} onChange={handleGuestContactChange} />
                </label>
                {escalationError ? <div className="auth-feedback auth-feedback-error">{escalationError}</div> : null}
                <button type="submit" className="chatbot-escalate" disabled={status === 'escalating'}>
                  {status === 'escalating' ? copy.sending : copy.escalationSubmit}
                </button>
              </form>
            </aside>
          ) : null}

          <form className="chatbot-input-row" onSubmit={handleSubmit}>
            <label className="visually-hidden" htmlFor="chatbot-message">
              {copy.placeholder}
            </label>
            <textarea
              id="chatbot-message"
              rows={2}
              value={input}
              placeholder={copy.placeholder}
              disabled={status === 'loading'}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleInputKeyDown}
            />
            <button type="submit" className="button-primary" disabled={status === 'loading' || !input.trim()}>
              {status === 'loading' ? copy.sending : copy.send}
            </button>
          </form>
        </section>
      ) : null}
    </div>
  )
}
