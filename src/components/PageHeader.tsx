import React from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  className = '',
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800 lg:text-3xl dark:text-gray-100'>
            {title}
          </h1>
          {subtitle && (
            <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className='flex items-center gap-2'>{actions}</div>}
      </div>
    </div>
  )
}
