import React from 'react'
import { useLocation } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { UserDropdown } from './UserDropdown'
import { useUserProfile } from '../hooks/useUserProfile'
import { ThemeToggleCompact } from './ThemeToggle'

const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case '/':
      return 'Assistant'
    case '/insights':
      return 'Insights'
    case '/calm':
      return 'Calm Space'
    case '/babies':
      return 'Manage Babies'
    default:
      return 'Lilybug'
  }
}

export const MobileHeader: React.FC = () => {
  const { displayName, loading } = useUserProfile()
  const location = useLocation()
  const pageTitle = getPageTitle(location.pathname)

  return (
    <header className='lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-30'>
      {/* Logo and Page Title */}
      <div className='flex items-center gap-3'>
        <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
          <Sparkles size={20} className='text-white' />
        </div>
        <span className='text-xl font-bold text-gray-800 dark:text-gray-100'>
          {pageTitle}
        </span>
      </div>

      {/* Theme Toggle and User Dropdown */}
      <div className='flex items-center gap-2'>
        <ThemeToggleCompact />
        {!loading && <UserDropdown userName={displayName} variant='mobile' />}
      </div>
    </header>
  )
}
