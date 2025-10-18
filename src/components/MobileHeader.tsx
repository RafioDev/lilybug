import React from 'react'
import { useLocation } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { UserDropdown } from './UserDropdown'
import type { Profile } from '../types'

interface UserProfileData {
  profile: Profile | null
  userEmail: string
  displayName: string
  loading: boolean
}

const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case '/':
      return 'Assistant'
    case '/insights':
      return 'Insights'
    case '/babies':
      return 'Manage Babies'
    default:
      return 'Lilybug'
  }
}

interface MobileHeaderProps {
  userProfile: UserProfileData
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ userProfile }) => {
  const { displayName, loading } = userProfile
  const location = useLocation()
  const pageTitle = getPageTitle(location.pathname)

  return (
    <header className='sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden dark:border-gray-700 dark:bg-gray-800'>
      {/* Logo and Page Title */}
      <div className='flex items-center gap-3'>
        <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600'>
          <Sparkles size={20} className='text-white' />
        </div>
        <span className='text-xl font-bold text-gray-800 dark:text-gray-100'>
          {pageTitle}
        </span>
      </div>

      {/* User Dropdown */}
      <div className='flex items-center'>
        {!loading && <UserDropdown userName={displayName} variant='mobile' />}
      </div>
    </header>
  )
}
