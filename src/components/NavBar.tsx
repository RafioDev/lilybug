import React from 'react'
import { Baby, Heart, Smile, Shield } from 'lucide-react'

interface NavBarProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export const NavBar: React.FC<NavBarProps> = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: 'tracker', label: 'Actions', icon: Baby },
    { id: 'dashboard', label: 'Insights', icon: Heart },
    { id: 'tips', label: 'Tips', icon: Smile },
    { id: 'calm', label: 'Calm', icon: Shield },
  ]

  return (
    <nav className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 safe-area-bottom lg:hidden'>
      <div className='flex justify-around items-center px-2 py-2'>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span
                className={`text-xs font-medium ${
                  isActive ? 'font-semibold' : ''
                }`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
