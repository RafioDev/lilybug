import React from 'react'
import { useLocation } from 'react-router-dom'
import { Baby as BabyIcon } from 'lucide-react'
import { dateUtils } from '../utils/dateUtils'
import { useActiveBaby } from '../hooks/queries/useBabyQueries'
import { useHeader } from '../contexts/HeaderContext'

interface HeaderProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
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

export const Header: React.FC<HeaderProps> = ({
  title: propTitle,
  subtitle: propSubtitle,
  actions: propActions,
  className = '',
}) => {
  const location = useLocation()
  const { data: activeBaby, isLoading } = useActiveBaby()
  const {
    title: contextTitle,
    subtitle: contextSubtitle,
    actions: contextActions,
  } = useHeader()

  // Use context values if available, otherwise fall back to props, then to auto-detected title
  const title = contextTitle || propTitle || getPageTitle(location.pathname)
  const subtitle = contextSubtitle || propSubtitle
  const actions = contextActions || propActions

  const renderBabyInfo = () => {
    if (isLoading) {
      return (
        <div className='flex items-center gap-2'>
          <div className='h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-600'></div>
          <div className='h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-600'></div>
        </div>
      )
    }

    if (!activeBaby) {
      return (
        <div className='flex items-center gap-2'>
          <BabyIcon className='h-4 w-4 text-gray-400 dark:text-gray-500' />
          <span className='text-sm text-gray-500 dark:text-gray-400'>
            No baby selected
          </span>
        </div>
      )
    }

    return (
      <div className='flex items-center gap-2'>
        <BabyIcon className='h-4 w-4 text-blue-600 dark:text-blue-400' />
        <div className='flex items-center gap-2'>
          <span className='font-medium text-gray-900 dark:text-gray-100'>
            {activeBaby.name}
          </span>
          <span className='text-sm text-gray-600 dark:text-gray-400'>
            {dateUtils.calculateAge(activeBaby.birthdate)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <header
      className={`sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      {/* Left side - Page title */}
      <div className='flex items-center'>
        <div>
          <h1 className='text-xl font-bold text-gray-900 dark:text-gray-100'>
            {title}
          </h1>
          {subtitle && (
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className='ml-4 flex items-center gap-2'>{actions}</div>
        )}
      </div>

      {/* Right side - Baby info */}
      <div className='flex items-center'>{renderBabyInfo()}</div>
    </header>
  )
}
