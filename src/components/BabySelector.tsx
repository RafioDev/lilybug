import React, { useState, useEffect } from 'react'
import { ChevronDown, Baby as BabyIcon } from 'lucide-react'
import { babyService } from '../services/babyService'
import { dateUtils } from '../utils/dateUtils'
import { LoadingState } from './LoadingState'
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
        className={`flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg ${className}`}
      >
        <BabyIcon className='w-4 h-4 text-blue-600' />
        <div>
          <span className='font-medium text-blue-900'>{activeBaby?.name}</span>
          {activeBaby && (
            <span className='text-xs text-blue-600 ml-2'>
              {dateUtils.calculateAge(activeBaby.birthdate)}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center justify-between w-full px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors'
      >
        <div className='flex items-center gap-2'>
          <BabyIcon className='w-4 h-4 text-blue-600' />
          <div className='text-left'>
            <span className='font-medium text-blue-900'>
              {activeBaby?.name || 'Select Baby'}
            </span>
            {activeBaby && (
              <span className='text-xs text-blue-600 ml-2'>
                {dateUtils.calculateAge(activeBaby.birthdate)}
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-blue-600 transition-transform ${
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
          <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20'>
            {babies.map((baby) => (
              <button
                key={baby.id}
                onClick={() => handleBabySelect(baby)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  baby.id === activeBaby?.id
                    ? 'bg-blue-50 text-blue-900'
                    : 'text-gray-900'
                }`}
              >
                <BabyIcon
                  className={`w-4 h-4 ${
                    baby.id === activeBaby?.id
                      ? 'text-blue-600'
                      : 'text-gray-600'
                  }`}
                />
                <div>
                  <span className='font-medium'>{baby.name}</span>
                  <span className='text-xs text-gray-500 ml-2'>
                    {dateUtils.calculateAge(baby.birthdate)}
                  </span>
                </div>
                {baby.id === activeBaby?.id && (
                  <span className='ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>
                    Active
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
