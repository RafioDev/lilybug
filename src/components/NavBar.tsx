import React from 'react'
import { NavLink } from 'react-router-dom'
import { Sparkles, Heart, Users } from 'lucide-react'

export const NavBar: React.FC = () => {
  const navItems = [
    { path: '/', label: 'AI Chat', icon: Sparkles },
    { path: '/insights', label: 'Insights', icon: Heart },
    { path: '/babies', label: 'Babies', icon: Users },
  ]

  return (
    <nav className='safe-area-bottom fixed right-0 bottom-0 left-0 z-40 border-t border-gray-200 bg-white shadow-lg lg:hidden dark:border-gray-700 dark:bg-gray-800'>
      <div className='flex items-center justify-around px-2 py-2'>
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  <span
                    className={`text-xs font-medium ${
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
      </div>
    </nav>
  )
}
