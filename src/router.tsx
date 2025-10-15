import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthPage } from './pages/AuthPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { AIHomePage } from './pages/AIHomePage'

import { DashboardPage } from './pages/DashboardPage'
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
        element: <AIHomePage />,
      },
      {
        path: 'activities',
        element: <Navigate to='/' replace />,
      },
      {
        path: 'insights',
        element: <DashboardPage />,
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
