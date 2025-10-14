import React from 'react'

interface LayoutProps {
  children: React.ReactNode
  title?: string
  onDataRefresh?: () => void
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  onDataRefresh,
}) => {
  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 pb-24 lg:pb-0'>
      <main className='px-4 py-5 lg:px-8 lg:py-8 lg:max-w-7xl lg:mx-auto'>
        {title && (
          <div className='hidden lg:block mb-8'>
            <h1 className='text-3xl font-bold text-gray-800'>{title}</h1>
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
