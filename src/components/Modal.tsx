import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { IconButton } from './Button'

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
    <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center'>
      {/* Enhanced backdrop with better dark mode styling */}
      <div
        className='absolute inset-0 bg-black/50 dark:bg-black/75 backdrop-blur-sm transition-opacity duration-200'
        onClick={onClose}
      />
      {/* Enhanced modal container with improved dark mode styling */}
      <div
        className={`relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-t-3xl sm:rounded-3xl shadow-2xl dark:shadow-2xl dark:shadow-black/50 w-full ${sizeStyles[size]} max-h-[90vh] overflow-y-auto animate-slide-up`}
      >
        {title && (
          <div className='flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-600 sticky top-0 bg-white dark:bg-gray-800 rounded-t-3xl z-10'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
              {title}
            </h2>
            <IconButton
              icon={<X size={24} />}
              onClick={onClose}
              variant='outline'
              size='md'
              aria-label='Close modal'
              className='border-0 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700/80 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200 rounded-lg'
            />
          </div>
        )}
        {/* Enhanced content area with better text contrast */}
        <div className='p-5 text-gray-900 dark:text-gray-100'>{children}</div>
      </div>
    </div>
  )
}
