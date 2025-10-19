import React from 'react'
import { ThemeToggle } from '../ThemeToggle'

export const GeneralTab: React.FC = () => {
  return (
    <div>
      {/* Tab Header */}
      <div className='mb-8'>
        <h2 className='mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100'>
          General Settings
        </h2>
        <p className='text-gray-600 dark:text-gray-400'>
          Application preferences and general configuration
        </p>
      </div>

      {/* Theme Settings */}
      <div className='mb-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
        <div className='mb-4'>
          <h3 className='mb-2 text-lg font-medium text-gray-900 dark:text-gray-100'>
            Appearance
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Choose how the app looks to you. Select a single theme, or sync with
            your system and automatically switch between day and night themes.
          </p>
        </div>
        <div className='flex items-center justify-between'>
          <div>
            <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              Theme
            </label>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              Select your preferred color scheme
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
