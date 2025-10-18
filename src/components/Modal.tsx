import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { IconButton } from './Button'
import { cn } from '../utils/cn'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md lg:max-w-lg',
    lg: 'max-w-lg lg:max-w-2xl',
    full: 'max-w-full mx-4',
  }

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center sm:items-center'>
      {/* Enhanced backdrop with better dark mode styling */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 dark:bg-black/75'
        onClick={onClose}
      />
      {/* Enhanced modal container with improved dark mode styling */}
      <div
        className={cn(
          'relative border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800',
          'rounded-t-3xl shadow-2xl sm:rounded-3xl dark:shadow-2xl dark:shadow-black/50',
          'animate-slide-up max-h-[90vh] w-full overflow-y-auto',
          sizeStyles[size]
        )}
      >
        {title && (
          <div className='sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-gray-200 bg-white p-5 dark:border-gray-600 dark:bg-gray-800'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
              {title}
            </h2>
            <IconButton
              icon={<X size={24} />}
              onClick={onClose}
              variant='outline'
              size='md'
              aria-label='Close modal'
              className='rounded-lg border-0 bg-transparent text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700/80 dark:hover:text-gray-200'
            />
          </div>
        )}
        {/* Enhanced content area with better text contrast */}
        <div className='p-5 text-gray-900 dark:text-gray-100'>{children}</div>
      </div>
    </div>
  )
}
