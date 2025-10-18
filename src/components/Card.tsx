import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  onClick?: () => void
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  onClick,
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const interactiveStyles = onClick
    ? 'cursor-pointer active:scale-[0.98] transition-transform'
    : ''

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 ${paddingStyles[padding]} ${interactiveStyles} ${className}`}
    >
      {children}
    </div>
  )
}
