import React from 'react'
import { Baby, Heart, Smile, Shield, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface SidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
}) => {
  const navItems = [
    { id: 'tracker', label: 'Quick Actions', icon: Baby },
    { id: 'dashboard', label: 'Insights', icon: Heart },
    { id: 'tips', label: 'Tips', icon: Smile },
    { id: 'calm', label: 'Calm Space', icon: Shield },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <aside className='hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200 lg:shadow-sm'>
      <div className='flex flex-col flex-1 min-h-0'>
        {/* Logo/Brand */}
        <div className='flex items-center h-16 px-6 border-b border-gray-200'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center'>
              <Baby size={20} className='text-white' />
            </div>
            <span className='text-xl font-bold text-gray-800'>Lilybug</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className='flex-1 px-4 py-6 space-y-2'>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  isActive
                    ? 'text-blue-600 bg-blue-50 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span
                  className={`font-medium ${isActive ? 'font-semibold' : ''}`}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Sign Out */}
        <div className='px-4 pb-6'>
          <button
            onClick={handleSignOut}
            className='w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all'
          >
            <LogOut size={20} />
            <span className='font-medium'>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
