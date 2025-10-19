import React from 'react'
import { useLocation } from 'react-router-dom'
import { Sparkles, Baby as BabyIcon } from 'lucide-react'
import { UserDropdown } from './UserDropdown'
import { dateUtils } from '../utils/dateUtils'
import { useActiveBaby } from '../hooks/queries/useBabyQueries'
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
      return 'Activities'
    case '/insights':
      return 'Insights'
    case '/settings':
      return 'Settings'
    default:
      return 'App'
  }
}

interface MobileHeaderProps {
  userProfile: UserProfileData
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ userProfile }) => {
  const { displayName, loading } = userProfile
  const location = useLocation()
  const pageTitle = getPageTitle(location.pathname)
  const { data: activeBaby, isLoading: babyLoading } = useActiveBaby()

  const renderBabyInfo = () => {
    if (babyLoading) {
      return (
        <div className='flex items-center gap-2'>
          <div className='h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-600'></div>
          <div className='h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-600'></div>
        </div>
      )
    }

    if (!activeBaby) {
      return (
        <div className='flex items-center gap-2'>
          <BabyIcon className='h-4 w-4 text-gray-400 dark:text-gray-500' />
          <span className='text-xs text-gray-500 dark:text-gray-400'>
            No baby
          </span>
        </div>
      )
    }

    return (
      <div className='flex items-center gap-2'>
        <BabyIcon className='h-4 w-4 text-blue-600 dark:text-blue-400' />
        <div className='flex items-center gap-1'>
          <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
            {activeBaby.name}
          </span>
          <span className='text-xs text-gray-600 dark:text-gray-400'>
            {dateUtils.calculateAge(activeBaby.birthdate)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <header className='sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden dark:border-gray-700 dark:bg-gray-800'>
      {/* Left side - Logo and Page Title */}
      <div className='flex items-center gap-3'>
        <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600'>
          <Sparkles size={20} className='text-white' />
        </div>
        <span className='text-lg font-bold text-gray-800 dark:text-gray-100'>
          {pageTitle}
        </span>
      </div>

      {/* Right side - Baby info and User Dropdown */}
      <div className='flex items-center gap-4'>
        {renderBabyInfo()}
        {!loading && <UserDropdown userName={displayName} variant='mobile' />}
      </div>
    </header>
  )
}
