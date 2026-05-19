/* eslint-disable react/prop-types */
import { useAuth } from '../context/AuthContext'
import { Chatbot } from './Chatbot'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

export function AppShell({ children }) {
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-base-100 text-base-content font-sans">
      <Navbar />
      <main className="flex-1 w-full flex flex-col">{children}</main>
      <Footer />
      <Chatbot currentUser={user} />
    </div>
  )
}
