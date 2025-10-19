import React, { useEffect } from 'react'
import { useHeader } from '../contexts/HeaderContext'

interface LayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  onDataRefresh?: () => void
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  subtitle,
  actions,
}) => {
  const { setHeaderInfo } = useHeader()

  // Update header context when props change
  useEffect(() => {
    setHeaderInfo({ title, subtitle, actions })

    // Clear header info when component unmounts
    return () => {
      setHeaderInfo({})
    }
  }, [title, subtitle, actions, setHeaderInfo])

  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 pb-24 lg:pb-0 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <main className='px-4 py-5 lg:mx-auto lg:max-w-7xl lg:px-8 lg:py-8'>
        {children}
      </main>
    </div>
  )
}
