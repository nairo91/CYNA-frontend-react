/* eslint-disable react/prop-types */
import { useAuth } from '../context/AuthContext'
import { Chatbot } from './Chatbot'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

export function AppShell({ children }) {
  const { user } = useAuth()

  return (
    <div className="page-shell">
      <Navbar />
      <main>{children}</main>
      <Footer />
      <Chatbot currentUser={user} />
    </div>
  )
}
