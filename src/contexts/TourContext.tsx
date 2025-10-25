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
  tourAnalytics?: TourAnalytics
}

interface TourAnalytics {
  totalToursStarted: number
  totalToursCompleted: number
  totalToursSkipped: number
  lastTourStartedAt?: string
  lastTourCompletedAt?: string
  lastTourSkippedAt?: string
  stepProgression: { [stepIndex: number]: number } // Track how many times each step was viewed
  averageCompletionTime?: number // In milliseconds
  tourSessions: TourSession[]
}

interface TourSession {
  id: string
  startedAt: string
  completedAt?: string
  skippedAt?: string
  endedAt?: string
  stepsViewed: number[]
  totalSteps: number
  completionType: 'completed' | 'skipped' | 'abandoned'
  durationMs?: number
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
  getTourAnalytics: () => TourAnalytics
  currentSession: TourSession | null
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
        tourAnalytics: getInitialAnalytics(),
        ...parsed,
      }
    }
  } catch (error) {
    console.warn('Failed to load tour preferences from localStorage:', error)
  }

  return {
    hasCompletedInitialTour: false,
    preferredTourSpeed: 'normal',
    tourAnalytics: getInitialAnalytics(),
  }
}

// Get initial analytics structure
const getInitialAnalytics = (): TourAnalytics => ({
  totalToursStarted: 0,
  totalToursCompleted: 0,
  totalToursSkipped: 0,
  stepProgression: {},
  tourSessions: [],
})

// Generate unique session ID
const generateSessionId = (): string => {
  return `tour_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
  const [currentSession, setCurrentSession] = useState<TourSession | null>(null)

  const startTour = useCallback(
    (tourSteps?: TourStep[]) => {
      const stepsToUse =
        tourSteps || getAvailableTourSteps(ONBOARDING_TOUR_STEPS, [], false)

      setSteps(stepsToUse)
      setCurrentStep(0)
      setIsActive(true)

      // Create new tour session
      const sessionId = generateSessionId()
      const newSession: TourSession = {
        id: sessionId,
        startedAt: new Date().toISOString(),
        stepsViewed: [0], // Start with first step
        totalSteps: stepsToUse.length,
        completionType: 'abandoned', // Default, will be updated on completion/skip
      }
      setCurrentSession(newSession)

      // Update analytics
      const currentAnalytics =
        preferences.tourAnalytics || getInitialAnalytics()
      const updatedAnalytics: TourAnalytics = {
        ...currentAnalytics,
        totalToursStarted: currentAnalytics.totalToursStarted + 1,
        lastTourStartedAt: new Date().toISOString(),
      }

      const newPreferences = {
        ...preferences,
        tourAnalytics: updatedAnalytics,
      }
      setPreferences(newPreferences)
      savePreferences(newPreferences)
    },
    [preferences]
  )

  const endTour = useCallback(() => {
    // Update current session if it exists
    if (currentSession) {
      const endedAt = new Date().toISOString()
      const durationMs =
        new Date(endedAt).getTime() -
        new Date(currentSession.startedAt).getTime()

      const completedSession: TourSession = {
        ...currentSession,
        endedAt,
        durationMs,
        completionType: currentSession.completionType || 'abandoned',
      }

      // Update analytics with completed session
      const currentAnalytics =
        preferences.tourAnalytics || getInitialAnalytics()
      const updatedSessions = [
        ...currentAnalytics.tourSessions,
        completedSession,
      ]

      // Calculate average completion time for completed tours
      const completedSessions = updatedSessions.filter(
        (s) => s.completionType === 'completed' && s.durationMs
      )
      const averageCompletionTime =
        completedSessions.length > 0
          ? completedSessions.reduce((sum, s) => sum + (s.durationMs || 0), 0) /
            completedSessions.length
          : undefined

      const updatedAnalytics: TourAnalytics = {
        ...currentAnalytics,
        tourSessions: updatedSessions,
        averageCompletionTime,
      }

      const newPreferences = {
        ...preferences,
        tourAnalytics: updatedAnalytics,
      }
      setPreferences(newPreferences)
      savePreferences(newPreferences)
    }

    setIsActive(false)
    setCurrentStep(0)
    setCurrentSession(null)
  }, [currentSession, preferences])

  const skipTour = useCallback(() => {
    const skippedAt = new Date().toISOString()

    // Update current session
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        skippedAt,
        completionType: 'skipped',
      })
    }

    // Update analytics
    const currentAnalytics = preferences.tourAnalytics || getInitialAnalytics()
    const updatedAnalytics: TourAnalytics = {
      ...currentAnalytics,
      totalToursSkipped: currentAnalytics.totalToursSkipped + 1,
      lastTourSkippedAt: skippedAt,
    }

    const newPreferences = {
      ...preferences,
      tourSkippedAt: skippedAt,
      tourAnalytics: updatedAnalytics,
    }
    setPreferences(newPreferences)
    savePreferences(newPreferences)
    endTour()
  }, [preferences, currentSession, endTour])

  const markTourCompleted = useCallback(() => {
    const completedAt = new Date().toISOString()

    // Update current session
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        completedAt,
        completionType: 'completed',
      })
    }

    // Update analytics
    const currentAnalytics = preferences.tourAnalytics || getInitialAnalytics()
    const updatedAnalytics: TourAnalytics = {
      ...currentAnalytics,
      totalToursCompleted: currentAnalytics.totalToursCompleted + 1,
      lastTourCompletedAt: completedAt,
    }

    const newPreferences = {
      ...preferences,
      hasCompletedInitialTour: true,
      tourCompletedAt: completedAt,
      tourAnalytics: updatedAnalytics,
    }
    setPreferences(newPreferences)
    savePreferences(newPreferences)
    endTour()
  }, [preferences, currentSession, endTour])

  const updatePreferences = useCallback(
    (updates: Partial<TourPreferences>) => {
      const newPreferences = { ...preferences, ...updates }
      setPreferences(newPreferences)
      savePreferences(newPreferences)
    },
    [preferences]
  )

  // Track step progression
  const trackStepView = useCallback(
    (stepIndex: number) => {
      if (currentSession) {
        // Update current session with viewed step
        const updatedStepsViewed = [
          ...new Set([...currentSession.stepsViewed, stepIndex]),
        ]
        setCurrentSession({
          ...currentSession,
          stepsViewed: updatedStepsViewed,
        })

        // Update step progression analytics
        const currentAnalytics =
          preferences.tourAnalytics || getInitialAnalytics()
        const updatedStepProgression = {
          ...currentAnalytics.stepProgression,
          [stepIndex]: (currentAnalytics.stepProgression[stepIndex] || 0) + 1,
        }

        const updatedAnalytics: TourAnalytics = {
          ...currentAnalytics,
          stepProgression: updatedStepProgression,
        }

        const newPreferences = {
          ...preferences,
          tourAnalytics: updatedAnalytics,
        }
        setPreferences(newPreferences)
        savePreferences(newPreferences)
      }
    },
    [currentSession, preferences]
  )

  // Enhanced setCurrentStep with analytics tracking
  const setCurrentStepWithTracking = useCallback(
    (step: number) => {
      setCurrentStep(step)
      // Only track if we have an active session and step is valid
      if (currentSession && step >= 0) {
        trackStepView(step)
      }
    },
    [trackStepView, currentSession]
  )

  // Get tour analytics
  const getTourAnalytics = useCallback((): TourAnalytics => {
    return preferences.tourAnalytics || getInitialAnalytics()
  }, [preferences.tourAnalytics])

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
    setCurrentStep: setCurrentStepWithTracking,
    getTourAnalytics,
    currentSession,
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

export type { TourStep, TourPreferences, TourAnalytics, TourSession }
