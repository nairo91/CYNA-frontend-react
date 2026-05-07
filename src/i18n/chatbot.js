export const chatbotCopy = {
  fr: {
    open: 'Ouvrir le chatbot',
    close: 'Fermer le chatbot',
    title: 'CyBot',
    status: 'Support instantane',
    assistantLabel: 'CyBot',
    userLabel: 'Vous',
    welcome: 'Bonjour, je peux vous aider sur les offres CYNA, le panier, les abonnements ou le support.',
    placeholder: 'Ecrivez votre question...',
    send: 'Envoyer',
    sending: 'Envoi...',
    error: 'Le chatbot est temporairement indisponible. Utilisez le formulaire de contact pour joindre le support.',
    escalationOffer: "Je peux transmettre toute cette conversation au support pour qu'un humain reprenne avec le contexte complet.",
    escalate: "Contacter l'assistance",
    contactForm: 'Ouvrir le formulaire',
    emailLabel: 'Adresse e-mail',
    nameLabel: 'Nom complet',
    subjectLabel: 'Objet',
    subjectDefault: 'Demande chatbot',
    escalationIntro: 'Transmettre cette conversation au support.',
    escalationSubmit: 'Contacter l\'assistance',
    escalationSuccess: 'Votre demande et la conversation ont ete transmises au support CYNA.',
    emailRequired: 'Indiquez votre nom et une adresse e-mail valide.',
    defaultEscalationMessage: 'Demande de rappel support depuis le chatbot.',
  },
  en: {
    open: 'Open chatbot',
    close: 'Close chatbot',
    title: 'CyBot',
    status: 'Instant support',
    assistantLabel: 'CyBot',
    userLabel: 'You',
    welcome: 'Hi, I can help with CYNA offers, cart, subscriptions, or support.',
    placeholder: 'Type your question...',
    send: 'Send',
    sending: 'Sending...',
    error: 'The chatbot is temporarily unavailable. Use the contact form to reach support.',
    escalationOffer: 'I can send this full conversation to support so a human can take over with the full context.',
    escalate: 'Contact support',
    contactForm: 'Open contact form',
    emailLabel: 'Email address',
    nameLabel: 'Full name',
    subjectLabel: 'Subject',
    subjectDefault: 'Chatbot request',
    escalationIntro: 'Send this conversation to support.',
    escalationSubmit: 'Contact support',
    escalationSuccess: 'Your request and the conversation have been sent to CYNA support.',
    emailRequired: 'Enter your name and a valid email address.',
    defaultEscalationMessage: 'Support callback request from the chatbot.',
  },
}

export function resolveChatbotLocale() {
  const raw =
    document.documentElement.lang ||
    navigator.language ||
    'fr'

  return raw.toLowerCase().startsWith('en') ? 'en' : 'fr'
}
