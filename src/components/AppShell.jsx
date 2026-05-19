/* eslint-disable react/prop-types */
import { useAuth } from '../context/AuthContext'
import { Chatbot } from './Chatbot'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

export function AppShell({ children }) {
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Aller au contenu principal
      </a>
      <Navbar />
      <main id="main-content" className="flex-1 w-full flex flex-col" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <Chatbot currentUser={user} />
    </div>
  )
}
