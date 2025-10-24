import React from 'react'
import { Baby as BabyIcon, Sparkles } from 'lucide-react'
import { dateUtils } from '../utils/dateUtils'
import { useActiveBaby } from '../hooks/queries/useBabyQueries'
import { useUserProfile } from '../hooks/queries/useProfileQueries'
import { UserDropdown } from './UserDropdown'
import { Link } from 'react-router-dom'

interface HeaderProps {
  className?: string
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const { data: activeBaby, isLoading } = useActiveBaby()
  const { data: profileData, isLoading: profileLoading } = useUserProfile()

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
          <BabyIcon className='h-3 w-3 text-gray-400 sm:h-4 sm:w-4 dark:text-gray-500' />
          <span className='text-xs text-gray-500 sm:text-sm dark:text-gray-400'>
            <span className='hidden sm:inline'>No baby selected</span>
            <span className='sm:hidden'>No baby</span>
          </span>
        </div>
      )
    }

    return (
      <div className='flex items-center gap-1.5 sm:gap-2'>
        <BabyIcon className='dark:text-white-400 h-3 w-3 text-gray-300 sm:h-4 sm:w-4' />
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

  return (
    <header
      className={`sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-3 sm:h-16 sm:px-6 dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      {/* Left side - Logo (mobile) and Page title */}
      <Link to='/' className='flex items-center gap-2'>
        {/* Mobile logo - only show on small screens */}
        <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600'>
          <Sparkles size={16} className='text-white' />
        </div>
        <h1 className='font-semibold'>Lilybug</h1>
      </Link>

      {/* Right side - Baby info and User Dropdown */}
      <div className='flex items-center gap-2 sm:gap-3'>
        {renderBabyInfo()}
        {!profileLoading && profileData && (
          <UserDropdown
            userName={profileData.displayName}
            variant='mobile'
            className='sm:hidden'
          />
        )}
        {!profileLoading && profileData && (
          <UserDropdown
            userName={profileData.displayName}
            variant='desktop'
            className='hidden sm:block'
          />
        )}
      </div>
    </header>
  )
}
