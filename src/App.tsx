import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { AuthPage } from './pages/AuthPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { TrackerPage } from './pages/TrackerPage'
import { TipsPage } from './pages/TipsPage'
import { DashboardPage } from './pages/DashboardPage'
import { CalmPage } from './pages/CalmPage'
import { NavBar } from './components/NavBar'
import { Sidebar } from './components/Sidebar'
import { profileService } from './services/profileService'
import type { User } from '@supabase/supabase-js'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)
  const [currentPage, setCurrentPage] = useState('tracker')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        checkProfile()
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      ;(() => {
        setUser(session?.user ?? null)
        if (session?.user) {
          checkProfile()
        } else {
          setHasProfile(null)
          setLoading(false)
        }
      })()
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkProfile = async () => {
    try {
      const profile = await profileService.getProfile()
      setHasProfile(!!profile)
    } catch (error) {
      console.error('Error checking profile:', error)
      setHasProfile(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-pulse space-y-4'>
            <div className='w-16 h-16 bg-blue-200 rounded-full mx-auto'></div>
            <p className='text-gray-500'>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  if (hasProfile === false) {
    return <OnboardingPage onComplete={() => setHasProfile(true)} />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'tracker':
        return <TrackerPage />
      case 'tips':
        return <TipsPage />
      case 'dashboard':
        return <DashboardPage />
      case 'calm':
        return <CalmPage />
      default:
        return <TrackerPage />
    }
  }

  return (
    <div className='min-h-screen lg:flex'>
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className='flex-1 lg:ml-64'>{renderPage()}</div>
      <NavBar currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  )
}

export default App
