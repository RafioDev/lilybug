import React, { useState, useRef, useEffect } from 'react'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { ThemeToggleDropdown } from './ThemeToggle'
import { Button, IconButton } from './Button'

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
        <IconButton
          icon={<User />}
          onClick={() => setIsOpen(!isOpen)}
          variant='outline'
          size='md'
          aria-label={`User menu for ${userName}`}
          className='text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
        />

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
              <Button
                onClick={handleSignOut}
                leftIcon={<LogOut />}
                variant='outline'
                size='sm'
                fullWidth
                className='justify-start text-gray-700 dark:text-gray-300 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg rounded-t-none'
              >
                Sign Out
              </Button>
            </div>
          </>
        )}
      </div>
    )
  }

  // Desktop variant
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        leftIcon={<User />}
        rightIcon={
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        }
        variant='outline'
        size='md'
        fullWidth
        className='justify-between text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'
      >
        <span className='font-medium truncate'>{userName}</span>
      </Button>

      {isOpen && (
        <>
          <div
            className='fixed inset-0 z-10'
            onClick={() => setIsOpen(false)}
          />
          <div className='absolute left-0 bottom-full mb-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20'>
            <ThemeToggleDropdown />
            <Button
              onClick={handleSignOut}
              leftIcon={<LogOut />}
              variant='outline'
              size='sm'
              fullWidth
              className='justify-start text-gray-700 dark:text-gray-300 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg rounded-t-none'
            >
              Sign Out
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
