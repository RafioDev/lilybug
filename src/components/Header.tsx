import React from 'react'
import { Baby as BabyIcon, ChevronLeft } from 'lucide-react'
import { dateUtils } from '../utils/dateUtils'
import { useActiveBaby, useBabies } from '../hooks/queries/useBabyQueries'
import { useUserProfile } from '../hooks/queries/useProfileQueries'

import { UserDropdown } from './UserDropdown'
import { Link, useLocation } from 'react-router-dom'
import { LilybugLogo } from './LilybugLogo'

interface HeaderProps {
  className?: string
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const { data: activeBaby, isLoading } = useActiveBaby()
  const { data: babies = [], isLoading: babiesLoading } = useBabies()
  const { data: profileData, isLoading: profileLoading } = useUserProfile()

  const location = useLocation()

  // Check if we're on the home page
  const isHomePage = location.pathname === '/'

  const renderBabyInfo = () => {
    if (isLoading || babiesLoading) {
      return (
        <div className='flex items-center gap-1.5 sm:gap-2'>
          <div className='h-3 w-3 animate-pulse rounded bg-gray-200 sm:h-4 sm:w-4 dark:bg-gray-600'></div>
          <div className='h-3 w-12 animate-pulse rounded bg-gray-200 sm:h-4 sm:w-20 dark:bg-gray-600'></div>
        </div>
      )
    }

    if (!activeBaby) {
      return (
        <div className='flex items-center gap-1.5 sm:gap-2'>
          <BabyIcon className='h-4 w-4 text-gray-600 sm:h-4 sm:w-4 dark:text-gray-400' />
          <span className='text-xs text-gray-500 sm:text-sm dark:text-gray-400'>
            <span className='hidden sm:inline'>No baby selected</span>
            <span className='sm:hidden'>No baby</span>
          </span>
        </div>
      )
    }

    const hasMultipleBabies = babies.length > 1
    const babyInfoContent = (
      <div className='flex items-center gap-1.5 sm:gap-2'>
        <BabyIcon className='h-4 w-4 text-gray-600 sm:h-4 sm:w-4 dark:text-gray-400' />
        <div className='flex items-center gap-1 sm:gap-2'>
          <span className='max-w-16 truncate text-sm font-semibold text-gray-900 sm:max-w-none sm:text-sm dark:text-gray-100'>
            {activeBaby.name}
          </span>
          <span className='text-xs whitespace-nowrap text-gray-600 sm:text-sm dark:text-gray-400'>
            {dateUtils.calculateAge(activeBaby.birthdate)}
          </span>
        </div>
      </div>
    )

    // If there are multiple babies, make it clickable
    if (hasMultipleBabies) {
      return (
        <Link
          to='/settings?tab=babies'
          className='block cursor-pointer rounded-lg px-2 py-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700'
          title='Switch baby or manage babies'
        >
          {babyInfoContent}
        </Link>
      )
    }

    return babyInfoContent
  }

  return (
    <header
      data-tour='app-header'
      className={`sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-3 sm:h-16 sm:px-6 dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      {/* Left side - Logo and Page title with back button */}
      <div className='flex items-center gap-1'>
        {/* Back button - only show when not on home page */}
        {!isHomePage && (
          <Link
            to='/'
            className='flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-100'
            aria-label='Back to home'
          >
            <ChevronLeft size={24} />
          </Link>
        )}
        <Link to='/' className='flex items-center' data-tour='app-logo'>
          <LilybugLogo className='h-14' />
        </Link>
      </div>

      {/* Right side - Baby info and User Dropdown */}
      <div className='flex items-center gap-2 sm:gap-3'>
        <div data-tour='baby-info'>{renderBabyInfo()}</div>
        {!profileLoading && profileData && (
          <div data-tour='user-dropdown'>
            <UserDropdown
              userName={profileData.displayName}
              variant='mobile'
              className='sm:hidden'
            />
            <UserDropdown
              userName={profileData.displayName}
              variant='desktop'
              className='hidden sm:block'
            />
          </div>
        )}
      </div>
    </header>
  )
}
