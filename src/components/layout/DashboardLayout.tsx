import { Outlet } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { DesktopHeader } from './DesktopHeader'
import { BottomNavigation } from './BottomNavigation'
import { useIsMobile } from '@/hooks/use-mobile'

export function DashboardLayout() {
  const isMobile = useIsMobile()

  // Desktop Layout
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-background flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <DesktopHeader title="SuperAdmin" subtitle="Painel de Administracao SaaS" />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    )
  }

  // Mobile Layout
  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      <main className="flex-1 pb-20 p-4">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  )
}
