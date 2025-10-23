import React from 'react'
import { Baby as BabyIcon, Sparkles } from 'lucide-react'
import { dateUtils } from '../utils/dateUtils'
import { useActiveBaby } from '../hooks/queries/useBabyQueries'
import { useHeader } from '../contexts/HeaderContext'
import { useUserProfile } from '../hooks/queries/useProfileQueries'
import { UserDropdown } from './UserDropdown'
import { Breadcrumbs } from './Breadcrumbs'

interface HeaderProps {
  subtitle?: string
  actions?: React.ReactNode
  className?: string
}

export const Header: React.FC<HeaderProps> = ({
  subtitle: propSubtitle,
  actions: propActions,
  className = '',
}) => {
  const { data: activeBaby, isLoading } = useActiveBaby()
  const { data: profileData, isLoading: profileLoading } = useUserProfile()
  const { subtitle: contextSubtitle, actions: contextActions } = useHeader()

  // Use context values if available, otherwise fall back to props
  const subtitle = contextSubtitle || propSubtitle
  const actions = contextActions || propActions

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
        <BabyIcon className='h-3 w-3 text-blue-600 sm:h-4 sm:w-4 dark:text-blue-400' />
        <div className='flex items-center gap-1 sm:gap-2'>
          <span className='max-w-16 truncate text-xs font-medium text-gray-900 sm:max-w-none sm:text-sm dark:text-gray-100'>
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
      <div className='flex items-center gap-2'>
        {/* Mobile logo - only show on small screens */}
        <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 sm:hidden'>
          <Sparkles size={16} className='text-white' />
        </div>

        <div className='flex items-center'>
          <div>
            {/* Breadcrumbs handle both navigation and page title display */}
            <Breadcrumbs />
            {subtitle && (
              <p className='text-xs text-gray-600 sm:text-sm dark:text-gray-400'>
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className='ml-2 flex items-center gap-2 sm:ml-4'>
              {actions}
            </div>
          )}
        </div>
      </div>

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
