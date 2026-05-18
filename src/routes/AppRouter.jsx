import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import { AboutPage } from '../pages/AboutPage'
import { AccountPage } from '../pages/AccountPage'
import { CartPage } from '../pages/CartPage'
import { CGUPage } from '../pages/CGUPage'
import { CategoriesPage } from '../pages/CategoriesPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { ContactPage } from '../pages/ContactPage'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { HomePage } from '../pages/HomePage'
import { LegalPage } from '../pages/LegalPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { OrderConfirmationPage } from '../pages/OrderConfirmationPage'
import { ProductDetailPage } from '../pages/ProductDetailPage'
import { ProductsPage } from '../pages/ProductsPage'
import { RegisterPage } from '../pages/RegisterPage'
import { ResetPasswordPage } from '../pages/ResetPasswordPage'
import { VerifyEmailPage } from '../pages/VerifyEmailPage'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppShell>
            <Routes>
              {/* Pages publiques */}
              <Route path="/" element={<HomePage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/cgu" element={<CGUPage />} />
              <Route path="/mentions-legales" element={<LegalPage />} />
              <Route path="/a-propos" element={<AboutPage />} />

              {/* Auth */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Panier (accessible meme en invite) */}
              <Route path="/panier" element={<CartPage />} />

              {/* Tunnel de commande (auth requise) */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout/confirmation/:id"
                element={
                  <ProtectedRoute>
                    <OrderConfirmationPage />
                  </ProtectedRoute>
                }
              />

              {/* Espace client */}
              <Route
                path="/espace-client"
                element={
                  <ProtectedRoute>
                    <AccountPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AppShell>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
