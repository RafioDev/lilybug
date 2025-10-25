import React, { useState, useRef, useEffect } from 'react'
import { User, LogOut, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ComponentErrorBoundary } from './ComponentErrorBoundary'
import { supabase } from '../lib/supabase'

interface UserDropdownProps {
  userName: string
  variant?: 'desktop' | 'mobile'
  className?: string
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  userName,
  variant = 'desktop',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsOpen(false)
  }

  const handleSettings = () => {
    navigate('/settings')
    setIsOpen(false)
  }

  if (variant === 'mobile') {
    return (
      <ComponentErrorBoundary componentName='UserDropdown'>
        <div className={`relative ${className}`} ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label={`User menu for ${userName}`}
            className='cursor-pointer rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800 active:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100 dark:active:bg-gray-600'
          >
            <User className='pointer-events-none h-4 w-4' />
          </button>

          {isOpen && (
            <>
              <div
                className='fixed inset-0 z-10'
                onClick={() => setIsOpen(false)}
              />
              <div className='absolute top-full right-0 z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800'>
                <div className='border-b border-gray-100 px-4 py-3 dark:border-gray-700'>
                  <p className='truncate text-sm font-medium text-gray-900 dark:text-gray-100'>
                    {userName}
                  </p>
                </div>
                <div className='py-1'>
                  <button
                    onClick={handleSettings}
                    className='flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:active:bg-gray-600'
                    data-tour='settings-link'
                  >
                    <Settings className='pointer-events-none h-4 w-4' />
                    <span className='pointer-events-none'>Settings</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className='flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:active:bg-gray-600'
                  >
                    <LogOut className='pointer-events-none h-4 w-4' />
                    <span className='pointer-events-none'>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </ComponentErrorBoundary>
    )
  }

  // Desktop variant - compact for header use
  return (
    <ComponentErrorBoundary componentName='UserDropdown'>
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={`User menu for ${userName}`}
          className='cursor-pointer rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'
        >
          <User className='pointer-events-none h-4 w-4' />
        </button>

        {isOpen && (
          <>
            <div
              className='fixed inset-0 z-10'
              onClick={() => setIsOpen(false)}
            />
            <div className='absolute top-full right-0 z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800'>
              <div className='border-b border-gray-100 px-4 py-3 dark:border-gray-700'>
                <p className='truncate text-sm font-medium text-gray-900 dark:text-gray-100'>
                  {userName}
                </p>
              </div>
              <div className='py-1'>
                <button
                  onClick={handleSettings}
                  className='flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  data-tour='settings-link'
                >
                  <Settings className='pointer-events-none h-4 w-4' />
                  <span className='pointer-events-none'>Settings</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className='flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                >
                  <LogOut className='pointer-events-none h-4 w-4' />
                  <span className='pointer-events-none'>Sign Out</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </ComponentErrorBoundary>
  )
}
