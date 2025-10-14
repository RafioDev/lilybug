import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthPage } from './pages/AuthPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { TrackerPage } from './pages/TrackerPage'
import { ActivitiesPage } from './pages/ActivitiesPage'
import { DashboardPage } from './pages/DashboardPage'
import { CalmPage } from './pages/CalmPage'
import { BabyManagementPage } from './pages/BabyManagementPage'
import { AppLayout } from './components/AppLayout'

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/onboarding',
    element: <OnboardingPage onComplete={() => (window.location.href = '/')} />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to='/tracker' replace />,
      },
      {
        path: 'tracker',
        element: <TrackerPage />,
      },
      {
        path: 'activities',
        element: <ActivitiesPage />,
      },
      {
        path: 'insights',
        element: <DashboardPage />,
      },
      {
        path: 'calm',
        element: <CalmPage />,
      },
      {
        path: 'babies',
        element: <BabyManagementPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to='/' replace />,
  },
])
