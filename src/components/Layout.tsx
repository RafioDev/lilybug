import React from 'react'

interface LayoutProps {
  children: React.ReactNode
  title?: string
  onDataRefresh?: () => void
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 pb-24 lg:pb-0 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <main className='px-4 py-5 lg:mx-auto lg:max-w-7xl lg:px-8 lg:py-8'>
        {title && (
          <div className='mb-8 hidden lg:block'>
            <h1 className='text-3xl font-bold text-gray-800 dark:text-gray-100'>
              {title}
            </h1>
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
