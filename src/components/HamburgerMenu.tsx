import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, X, Sparkles, Heart, Settings } from 'lucide-react'

interface HamburgerMenuProps {
  className?: string
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isOpen && !target.closest('[data-hamburger-menu]')) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const navItems = [
    { path: '/', label: 'Activities', icon: Sparkles },
    { path: '/insights', label: 'Insights', icon: Heart },
    { path: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className={`relative ${className}`} data-hamburger-menu>
      {/* Menu Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X size={16} className='pointer-events-none' />
        ) : (
          <Menu size={16} className='pointer-events-none' />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div className='fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden' />
      )}

      {/* Slide-out Menu */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-64 transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden dark:bg-gray-800 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Menu Header */}
        <div className='flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
            Navigation
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className='flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            aria-label='Close menu'
          >
            <X size={18} className='pointer-events-none' />
          </button>
        </div>

        {/* Menu Items */}
        <nav className='flex flex-col p-4'>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span
                  className={`font-medium ${isActive ? 'font-semibold' : ''}`}
                >
                  {item.label}
                </span>
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
