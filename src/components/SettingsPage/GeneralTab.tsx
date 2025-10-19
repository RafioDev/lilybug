import React from 'react'
import { Settings } from 'lucide-react'

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

      {/* Placeholder Content */}
      <div className='rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800'>
        <Settings className='mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600' />
        <h3 className='mb-2 text-lg font-medium text-gray-900 dark:text-gray-100'>
          Coming Soon
        </h3>
        <p className='text-gray-500 dark:text-gray-400'>
          General settings and preferences will be available here in a future
          update.
        </p>
      </div>
    </div>
  )
}
