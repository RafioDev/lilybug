import React, { createContext, useContext } from 'react'
import { useUserProfile } from '../hooks/queries/useProfileQueries'
import type { TimeFormat } from '../utils/timeUtils'

interface TimeFormatContextType {
  timeFormat: TimeFormat
  isLoading: boolean
}

const TimeFormatContext = createContext<TimeFormatContextType | undefined>(
  undefined
)

export const TimeFormatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: profile, isLoading } = useUserProfile()

  // Default to 12h format if not set
  const timeFormat: TimeFormat = profile?.profile?.time_format || '12h'

  return (
    <TimeFormatContext.Provider value={{ timeFormat, isLoading }}>
      {children}
    </TimeFormatContext.Provider>
  )
}

export const useTimeFormat = () => {
  const context = useContext(TimeFormatContext)
  if (context === undefined) {
    throw new Error('useTimeFormat must be used within a TimeFormatProvider')
  }
  return context
}
