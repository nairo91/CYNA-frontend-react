import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import { HomePage } from '../pages/HomePage'
import { ProtectedRoute } from './ProtectedRoute'

const AboutPage = lazy(() => import('../pages/AboutPage').then((module) => ({ default: module.AboutPage })))
const AccountPage = lazy(() => import('../pages/AccountPage').then((module) => ({ default: module.AccountPage })))
const CartPage = lazy(() => import('../pages/CartPage').then((module) => ({ default: module.CartPage })))
const CategoriesPage = lazy(() => import('../pages/CategoriesPage').then((module) => ({ default: module.CategoriesPage })))
const CGUPage = lazy(() => import('../pages/CGUPage').then((module) => ({ default: module.CGUPage })))
const CheckoutPage = lazy(() => import('../pages/CheckoutPage').then((module) => ({ default: module.CheckoutPage })))
const ContactPage = lazy(() => import('../pages/ContactPage').then((module) => ({ default: module.ContactPage })))
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage').then((module) => ({ default: module.ForgotPasswordPage })))
const GoogleCallbackPage = lazy(() => import('../pages/GoogleCallbackPage').then((module) => ({ default: module.GoogleCallbackPage })))
const LegalPage = lazy(() => import('../pages/LegalPage').then((module) => ({ default: module.LegalPage })))
const LoginPage = lazy(() => import('../pages/LoginPage').then((module) => ({ default: module.LoginPage })))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })))
const OrderConfirmationPage = lazy(() => import('../pages/OrderConfirmationPage').then((module) => ({ default: module.OrderConfirmationPage })))
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage').then((module) => ({ default: module.ProductDetailPage })))
const ProductsPage = lazy(() => import('../pages/ProductsPage').then((module) => ({ default: module.ProductsPage })))
const RegisterPage = lazy(() => import('../pages/RegisterPage').then((module) => ({ default: module.RegisterPage })))
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage').then((module) => ({ default: module.ResetPasswordPage })))
const VerifyEmailPage = lazy(() => import('../pages/VerifyEmailPage').then((module) => ({ default: module.VerifyEmailPage })))

function RouteLoader() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1 overflow-hidden bg-primary/10" role="status" aria-label="Chargement">
      <div className="h-full w-1/3 animate-pulse rounded-r-full bg-primary" />
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppShell>
            <Suspense fallback={<RouteLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/cgu" element={<CGUPage />} />
                <Route path="/mentions-legales" element={<LegalPage />} />
                <Route path="/a-propos" element={<AboutPage />} />

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

                <Route path="/panier" element={<CartPage />} />

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
            </Suspense>
          </AppShell>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
