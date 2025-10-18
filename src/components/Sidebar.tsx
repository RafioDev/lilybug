import React from 'react'
import { NavLink } from 'react-router-dom'
import { Sparkles, Heart, Users } from 'lucide-react'
import { UserDropdown } from './UserDropdown'
import type { Profile } from '../types'

interface UserProfileData {
  profile: Profile | null
  userEmail: string
  displayName: string
  loading: boolean
}

interface SidebarProps {
  userProfile: UserProfileData
}

export const Sidebar: React.FC<SidebarProps> = ({ userProfile }) => {
  const { displayName, loading } = userProfile

  const navItems = [
    { path: '/', label: 'Assistant', icon: Sparkles },
    { path: '/insights', label: 'Insights', icon: Heart },
    { path: '/babies', label: 'Manage Babies', icon: Users },
  ]

  return (
    <aside className='hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white lg:shadow-sm lg:dark:border-gray-700 lg:dark:bg-gray-800'>
      <div className='flex min-h-0 flex-1 flex-col'>
        {/* Logo/Brand */}
        <div className='flex h-16 items-center border-b border-gray-200 px-6 dark:border-gray-700'>
          <div className='flex items-center gap-3'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600'>
              <Sparkles size={20} className='text-white' />
            </div>
            <span className='text-xl font-bold text-gray-800 dark:text-gray-100'>
              Lilybug
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className='flex-1 space-y-2 px-4 py-6'>
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                    isActive
                      ? 'border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span
                      className={`font-medium ${
                        isActive ? 'font-semibold' : ''
                      }`}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* User Dropdown */}
        <div className='px-4 pb-6'>
          {!loading && (
            <UserDropdown userName={displayName} variant='desktop' />
          )}
        </div>
      </div>
    </aside>
  )
}
