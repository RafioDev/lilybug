import React, { useState, useEffect } from 'react'
import { ChevronDown, Baby as BabyIcon } from 'lucide-react'
import { babyService } from '../services/babyService'
import { dateUtils } from '../utils/dateUtils'
import { LoadingState } from './LoadingState'
import { ComponentErrorBoundary } from './ComponentErrorBoundary'
import { useAsyncOperation } from '../hooks/useAsyncOperation'
import type { Baby } from '../types'

interface BabySelectorProps {
  onBabyChange?: (baby: Baby) => void
  className?: string
}

export const BabySelector: React.FC<BabySelectorProps> = ({
  onBabyChange,
  className = '',
}) => {
  const [babies, setBabies] = useState<Baby[]>([])
  const [activeBaby, setActiveBaby] = useState<Baby | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  // Use async operations for data loading
  const loadBabiesOperation = useAsyncOperation(() =>
    Promise.all([babyService.getBabies(), babyService.getActiveBaby()])
  )
  const setActiveBabyOperation = useAsyncOperation((...args: unknown[]) =>
    babyService.setActiveBaby(args[0] as string)
  )

  useEffect(() => {
    const loadBabies = async () => {
      try {
        const [babiesData, activeBabyData] = await loadBabiesOperation.execute()
        setBabies(babiesData)
        setActiveBaby(activeBabyData)
      } catch (error) {
        console.error('Error loading babies:', error)
      }
    }

    loadBabies()
  }, [loadBabiesOperation])

  const handleBabySelect = async (baby: Baby) => {
    try {
      await setActiveBabyOperation.execute(baby.id)
      setActiveBaby(baby)
      setIsOpen(false)
      if (onBabyChange) {
        onBabyChange(baby)
      }
    } catch (error) {
      console.error('Error setting active baby:', error)
    }
  }

  if (loadBabiesOperation.loading && babies.length === 0) {
    return (
      <div className={className}>
        <LoadingState message='Loading babies...' size='sm' />
      </div>
    )
  }

  if (babies.length === 0) {
    return null
  }

  if (babies.length === 1) {
    return (
      <div
        className={`flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-900/30 ${className}`}
      >
        <BabyIcon className='h-4 w-4 text-blue-600 dark:text-blue-400' />
        <div>
          <span className='font-medium text-blue-900 dark:text-blue-100'>
            {activeBaby?.name}
          </span>
          {activeBaby && (
            <span className='ml-2 text-xs text-blue-600 dark:text-blue-400'>
              {dateUtils.calculateAge(activeBaby.birthdate)}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <ComponentErrorBoundary
      componentName='BabySelector'
      contextData={{
        babyId: activeBaby?.id,
      }}
    >
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='flex w-full items-center justify-between rounded-lg bg-blue-50 px-3 py-2 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50'
        >
          <div className='flex items-center gap-2'>
            <BabyIcon className='h-4 w-4 text-blue-600 dark:text-blue-400' />
            <div className='text-left'>
              <span className='font-medium text-blue-900 dark:text-blue-100'>
                {activeBaby?.name || 'Select Baby'}
              </span>
              {activeBaby && (
                <span className='ml-2 text-xs text-blue-600 dark:text-blue-400'>
                  {dateUtils.calculateAge(activeBaby.birthdate)}
                </span>
              )}
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-blue-600 transition-transform dark:text-blue-400 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <>
            <div
              className='fixed inset-0 z-10'
              onClick={() => setIsOpen(false)}
            />
            <div className='absolute top-full right-0 left-0 z-20 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800'>
              {babies.map((baby) => (
                <button
                  key={baby.id}
                  onClick={() => handleBabySelect(baby)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    baby.id === activeBaby?.id
                      ? 'bg-blue-50 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <BabyIcon
                    className={`h-4 w-4 ${
                      baby.id === activeBaby?.id
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  />
                  <div>
                    <span className='font-medium'>{baby.name}</span>
                    <span className='ml-2 text-xs text-gray-500 dark:text-gray-400'>
                      {dateUtils.calculateAge(baby.birthdate)}
                    </span>
                  </div>
                  {baby.id === activeBaby?.id && (
                    <span className='ml-auto rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'>
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </ComponentErrorBoundary>
  )
}
