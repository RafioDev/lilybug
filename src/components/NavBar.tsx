import React from 'react'
import { NavLink } from 'react-router-dom'
import { Baby, Heart, Clock, Users } from 'lucide-react'

export const NavBar: React.FC = () => {
  const navItems = [
    { path: '/tracker', label: 'Tracker', icon: Baby },
    { path: '/activities', label: 'Activity', icon: Clock },
    { path: '/insights', label: 'Insights', icon: Heart },
    { path: '/babies', label: 'Babies', icon: Users },
  ]

  return (
    <nav className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 safe-area-bottom lg:hidden'>
      <div className='flex justify-around items-center px-2 py-2'>
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
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
