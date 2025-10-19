import React, { useState, useRef, useEffect } from 'react'
import { User, LogOut, ChevronDown } from 'lucide-react'
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

  if (variant === 'mobile') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={`User menu for ${userName}`}
          className='cursor-pointer rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'
        >
          <User className='h-5 w-5' />
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
              <button
                onClick={handleSignOut}
                className='flex w-full cursor-pointer items-center gap-2 rounded-b-lg px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
              >
                <LogOut className='h-4 w-4' />
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  // Desktop variant
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'
      >
        <div className='flex items-center gap-2'>
          <User className='h-4 w-4' />
          <span className='truncate font-medium'>{userName}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className='fixed inset-0 z-10'
            onClick={() => setIsOpen(false)}
          />
          <div className='absolute bottom-full left-0 z-20 mb-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800'>
            <button
              onClick={handleSignOut}
              className='flex w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
            >
              <LogOut className='h-4 w-4' />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
