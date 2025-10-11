import React, { useEffect } from 'react'
import { X } from 'lucide-react'

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
      <div
        className='absolute inset-0 bg-black/40 backdrop-blur-sm'
        onClick={onClose}
      />
      <div
        className={`relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full ${sizeStyles[size]} max-h-[90vh] overflow-y-auto animate-slide-up`}
      >
        {title && (
          <div className='flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl'>
            <h2 className='text-xl font-semibold text-gray-800'>{title}</h2>
            <button
              onClick={onClose}
              className='p-2 hover:bg-gray-100 rounded-full transition-colors'
            >
              <X size={24} className='text-gray-600' />
            </button>
          </div>
        )}
        <div className='p-5'>{children}</div>
      </div>
    </div>
  )
}
