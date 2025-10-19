import React from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme()

  const themes = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ]

  return (
    <div className='flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800'>
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
            theme === value
              ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
              : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100'
          } `}
          title={`Switch to ${label.toLowerCase()} theme`}
        >
          <Icon size={16} />
          <span className='hidden sm:inline'>{label}</span>
        </button>
      ))}
    </div>
  )
}
