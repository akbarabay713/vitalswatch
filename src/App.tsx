import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import { ErrorPage } from '@/pages/ErrorPage'

// code-split routes so the recharts-heavy timeline stays out of the other chunks
const TimelinePage = lazy(() =>
  import('@/pages/TimelinePage').then((m) => ({ default: m.TimelinePage })),
)
const CommitDeepDivePage = lazy(() =>
  import('@/pages/CommitDeepDivePage').then((m) => ({
    default: m.CommitDeepDivePage,
  })),
)
const RoiPage = lazy(() =>
  import('@/pages/RoiPage').then((m) => ({ default: m.RoiPage })),
)
const ComparePage = lazy(() =>
  import('@/pages/ComparePage').then((m) => ({ default: m.ComparePage })),
)

const RouteFallback = () => (
  <div className="flex h-64 items-center justify-center text-sm text-ink-subtle">
    Loading…
  </div>
)

const suspended = (node: React.ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{node}</Suspense>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: suspended(<TimelinePage />) },
      { path: 'commits', element: suspended(<CommitDeepDivePage />) },
      { path: 'commits/:hash', element: suspended(<CommitDeepDivePage />) },
      { path: 'compare', element: suspended(<ComparePage />) },
      { path: 'roi', element: suspended(<RoiPage />) },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

const App = () => <RouterProvider router={router} />

export default App
