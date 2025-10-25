import React from 'react'
import { Baby as BabyIcon, ChevronLeft, Play } from 'lucide-react'
import { dateUtils } from '../utils/dateUtils'
import { useActiveBaby } from '../hooks/queries/useBabyQueries'
import { useUserProfile } from '../hooks/queries/useProfileQueries'
import { useTour } from '../contexts/TourContext'
import {
  ONBOARDING_TOUR_STEPS,
  convertToJoyrideSteps,
} from '../config/tourSteps'
import { UserDropdown } from './UserDropdown'
import { Link, useLocation } from 'react-router-dom'
import { LilybugLogo } from './LilybugLogo'

interface HeaderProps {
  className?: string
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const { data: activeBaby, isLoading } = useActiveBaby()
  const { data: profileData, isLoading: profileLoading } = useUserProfile()
  const { startTour } = useTour()
  const location = useLocation()

  // Check if we're on the home page
  const isHomePage = location.pathname === '/'

  const renderBabyInfo = () => {
    if (isLoading) {
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

    return (
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
  }

  const handleStartTour = () => {
    // Don't start tour if profile data is still loading
    if (profileLoading || !profileData) {
      console.warn('Cannot start tour: Profile data not loaded yet')
      return
    }

    const steps = convertToJoyrideSteps(ONBOARDING_TOUR_STEPS)
    console.log(
      'Starting tour with steps:',
      steps.map((s, i) => `${i + 1}. ${s.title} (${s.target})`)
    )

    startTour(steps)
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
        {/* Test Tour Button - Remove this after testing */}
        <button
          onClick={handleStartTour}
          className='flex items-center gap-1 rounded-md bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600'
          title='Start Tour (Test)'
        >
          <Play size={12} />
          <span className='hidden sm:inline'>Tour</span>
        </button>

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
