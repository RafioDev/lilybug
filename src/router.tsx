import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthPage } from './pages/AuthPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { Activities } from './pages/Activities'
import { SettingsPage } from './pages/SettingsPage'
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
        element: <Activities />,
      },
      {
        path: 'activities',
        element: <Navigate to='/' replace />,
      },

      {
        path: 'babies',
        element: <Navigate to='/settings' replace />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to='/' replace />,
  },
])
