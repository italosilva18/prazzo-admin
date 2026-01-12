import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './store/auth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Companies from './pages/Companies'
import Users from './pages/Users'
import Billing from './pages/Billing'
import BillingPlans from './pages/billing/Plans'
import BillingSubscriptions from './pages/billing/Subscriptions'
import BillingInvoices from './pages/billing/Invoices'
import Analytics from './pages/Analytics'
import AnalyticsUsage from './pages/AnalyticsUsage'
import AnalyticsGrowth from './pages/AnalyticsGrowth'
import AnalyticsCompanies from './pages/AnalyticsCompanies'
import Reports from './pages/Reports'
import System from './pages/System'
import Support from './pages/Support'
import Notifications from './pages/Notifications'
import NotificationsBroadcast from './pages/NotificationsBroadcast'
import { DashboardLayout } from './components/layout/DashboardLayout'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'superadmin') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="companies" element={<Companies />} />
          <Route path="users" element={<Users />} />
          <Route path="billing" element={<Billing />} />
          <Route path="billing/plans" element={<BillingPlans />} />
          <Route path="billing/subscriptions" element={<BillingSubscriptions />} />
          <Route path="billing/invoices" element={<BillingInvoices />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="analytics/usage" element={<AnalyticsUsage />} />
          <Route path="analytics/growth" element={<AnalyticsGrowth />} />
          <Route path="analytics/companies" element={<AnalyticsCompanies />} />
          <Route path="reports" element={<Reports />} />
          <Route path="support" element={<Support />} />
          <Route path="system" element={<System />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="notifications/broadcast" element={<NotificationsBroadcast />} />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
