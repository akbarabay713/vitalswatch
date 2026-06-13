import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AppSidebar } from '@/components/organisms/AppSidebar'
import { cn } from '@/lib/cn'

export const DashboardLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {drawerOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 transition-transform duration-200 md:static md:z-auto md:translate-x-0 print:hidden',
          drawerOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <AppSidebar onNavigate={() => setDrawerOpen(false)} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-3 border-b border-border bg-surface/80 px-4 py-3 backdrop-blur md:hidden print:hidden">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border-strong text-ink-muted hover:text-ink"
          >
            <span className="text-lg leading-none" aria-hidden>
              ≡
            </span>
          </button>
          <span className="text-sm font-semibold text-ink">VitalsWatch</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
