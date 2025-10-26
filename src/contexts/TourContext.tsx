import React, { createContext, useContext, useState, useCallback } from 'react'
import {
  getAvailableTourSteps,
  ONBOARDING_TOUR_STEPS,
} from '../config/tourSteps'

interface TourStep {
  target: string
  content: React.ReactNode
  title?: string
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  disableBeacon?: boolean
  hideCloseButton?: boolean
  hideFooter?: boolean
  styles?: Record<string, unknown>
}

interface TourPreferences {
  hasCompletedInitialTour: boolean
  tourCompletedAt?: string
  tourSkippedAt?: string
  preferredTourSpeed?: 'slow' | 'normal' | 'fast'
}

interface TourContextValue {
  isActive: boolean
  currentStep: number
  totalSteps: number
  steps: TourStep[]
  startTour: (steps?: TourStep[]) => void
  endTour: () => void
  skipTour: () => void
  hasCompletedInitialTour: boolean
  markTourCompleted: () => void
  preferences: TourPreferences
  updatePreferences: (preferences: Partial<TourPreferences>) => void
  setCurrentStep: (step: number) => void
}

const TourContext = createContext<TourContextValue | undefined>(undefined)

interface TourProviderProps {
  children: React.ReactNode
}

// Local storage key for tour preferences
const TOUR_PREFERENCES_KEY = 'lilybug_tour_preferences'

// Get initial preferences from localStorage
const getInitialPreferences = (): TourPreferences => {
  try {
    const saved = localStorage.getItem(TOUR_PREFERENCES_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as TourPreferences
      return {
        preferredTourSpeed: 'normal' as const,
        ...parsed,
      }
    }
  } catch (error) {
    console.warn('Failed to load tour preferences from localStorage:', error)
  }

  return {
    hasCompletedInitialTour: false,
    preferredTourSpeed: 'normal',
  }
}

// Save preferences to localStorage
const savePreferences = (preferences: TourPreferences): void => {
  try {
    localStorage.setItem(TOUR_PREFERENCES_KEY, JSON.stringify(preferences))
  } catch (error) {
    console.warn('Failed to save tour preferences to localStorage:', error)
  }
}

export const TourProvider: React.FC<TourProviderProps> = ({ children }) => {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<TourStep[]>([])
  const [preferences, setPreferences] = useState<TourPreferences>(
    getInitialPreferences
  )

  const startTour = useCallback((tourSteps?: TourStep[]) => {
    const stepsToUse =
      tourSteps || getAvailableTourSteps(ONBOARDING_TOUR_STEPS, [], false)

    setSteps(stepsToUse)
    setCurrentStep(0)
    setIsActive(true)
  }, [])

  const endTour = useCallback(() => {
    setIsActive(false)
    setCurrentStep(0)
  }, [])

  const skipTour = useCallback(() => {
    const newPreferences = {
      ...preferences,
      tourSkippedAt: new Date().toISOString(),
    }
    setPreferences(newPreferences)
    savePreferences(newPreferences)
    endTour()
  }, [preferences, endTour])

  const markTourCompleted = useCallback(() => {
    const newPreferences = {
      ...preferences,
      hasCompletedInitialTour: true,
      tourCompletedAt: new Date().toISOString(),
    }
    setPreferences(newPreferences)
    savePreferences(newPreferences)
    endTour()
  }, [preferences, endTour])

  const updatePreferences = useCallback(
    (updates: Partial<TourPreferences>) => {
      const newPreferences = { ...preferences, ...updates }
      setPreferences(newPreferences)
      savePreferences(newPreferences)
    },
    [preferences]
  )

  const value: TourContextValue = {
    isActive,
    currentStep,
    totalSteps: steps.length,
    steps,
    startTour,
    endTour,
    skipTour,
    hasCompletedInitialTour: preferences.hasCompletedInitialTour,
    markTourCompleted,
    preferences,
    updatePreferences,
    setCurrentStep,
  }

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>
}

export const useTour = (): TourContextValue => {
  const context = useContext(TourContext)
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider')
  }
  return context
}

export type { TourStep, TourPreferences }
