import React, { useState, useRef, useEffect } from 'react'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { ThemeToggleDropdown } from './ThemeToggle'

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
          className='p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors'
        >
          <User className='w-5 h-5' />
        </button>

        {isOpen && (
          <>
            <div
              className='fixed inset-0 z-10'
              onClick={() => setIsOpen(false)}
            />
            <div className='absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20'>
              <div className='px-4 py-3 border-b border-gray-100 dark:border-gray-700'>
                <p className='text-sm font-medium text-gray-900 dark:text-gray-100 truncate'>
                  {userName}
                </p>
              </div>
              <ThemeToggleDropdown />
              <button
                onClick={handleSignOut}
                className='w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-b-lg'
              >
                <LogOut className='w-4 h-4' />
                <span className='text-sm'>Sign Out</span>
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
        className='w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all'
      >
        <div className='flex items-center gap-3'>
          <User className='w-5 h-5' />
          <span className='font-medium truncate'>{userName}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
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
          <div className='absolute left-0 bottom-full mb-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20'>
            <ThemeToggleDropdown />
            <button
              onClick={handleSignOut}
              className='w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-b-lg'
            >
              <LogOut className='w-4 h-4' />
              <span className='text-sm'>Sign Out</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
