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
    <aside className='hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:dark:bg-gray-800 lg:border-r lg:border-gray-200 lg:dark:border-gray-700 lg:shadow-sm'>
      <div className='flex flex-col flex-1 min-h-0'>
        {/* Logo/Brand */}
        <div className='flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
              <Sparkles size={20} className='text-white' />
            </div>
            <span className='text-xl font-bold text-gray-800 dark:text-gray-100'>
              Lilybug
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className='flex-1 px-4 py-6 space-y-2'>
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
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
