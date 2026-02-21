import React, {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useEffect,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Profile, Baby, TrackerEntry } from '../types'

interface DemoContextValue {
  isDemo: boolean
  demoUser: {
    id: string
    email: string
  }
  demoProfile: Profile
  demoBabies: Baby[]
  demoEntries: TrackerEntry[]
}

const DemoContext = createContext<DemoContextValue | undefined>(undefined)

export const useDemoContext = () => {
  const context = useContext(DemoContext)
  if (!context) {
    throw new Error('useDemoContext must be used within DemoProvider')
  }
  return context
}

interface DemoProviderProps {
  children: ReactNode
}

// Generate demo data outside component to avoid re-renders
const generateDemoData = () => {
  const now = new Date()
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  return {
    demoUser: {
      id: 'demo-user-id',
      email: 'demo@lilybug.app',
    },
    demoProfile: {
      id: 'demo-user-id',
      parent1_name: 'Demo Parent',
      parent2_name: null,
      active_baby_id: 'demo-baby-id',
      time_format: '12h' as const,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    demoBabies: [
      {
        id: 'demo-baby-id',
        user_id: 'demo-user-id',
        name: 'Baby Demo',
        birthdate: threeMonthsAgo.toISOString(),
        is_active: true,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      },
    ],
    demoEntries: [
      // Today's entries
      {
        id: 'demo-entry-1',
        user_id: 'demo-user-id',
        baby_id: 'demo-baby-id',
        entry_type: 'feeding',
        start_time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        end_time: new Date(now.getTime() - 1.75 * 60 * 60 * 1000).toISOString(),
        quantity: 4,
        feeding_type: 'bottle',
        notes: null,
        created_at: new Date().toISOString(),
      },
      {
        id: 'demo-entry-2',
        user_id: 'demo-user-id',
        baby_id: 'demo-baby-id',
        entry_type: 'diaper',
        start_time: new Date(
          now.getTime() - 1.5 * 60 * 60 * 1000
        ).toISOString(),
        end_time: null,
        diaper_type: 'wet',
        notes: null,
        created_at: new Date().toISOString(),
      },
      {
        id: 'demo-entry-3',
        user_id: 'demo-user-id',
        baby_id: 'demo-baby-id',
        entry_type: 'sleep',
        start_time: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() - 2.5 * 60 * 60 * 1000).toISOString(),
        notes: null,
        created_at: new Date().toISOString(),
      },
      // Yesterday's entries
      {
        id: 'demo-entry-4',
        user_id: 'demo-user-id',
        baby_id: 'demo-baby-id',
        entry_type: 'feeding',
        start_time: new Date(now.getTime() - 20 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(
          now.getTime() - 19.75 * 60 * 60 * 1000
        ).toISOString(),
        quantity: 5,
        feeding_type: 'breast_left',
        notes: null,
        created_at: new Date().toISOString(),
      },
      {
        id: 'demo-entry-5',
        user_id: 'demo-user-id',
        baby_id: 'demo-baby-id',
        entry_type: 'diaper',
        start_time: new Date(now.getTime() - 22 * 60 * 60 * 1000).toISOString(),
        end_time: null,
        diaper_type: 'both',
        notes: null,
        created_at: now.toISOString(),
      },
    ] as TrackerEntry[],
  }
}

export const DemoProvider: React.FC<DemoProviderProps> = ({ children }) => {
  const demoData = useMemo(() => generateDemoData(), [])
  const queryClient = useQueryClient()

  // Initialize the query cache with demo entries
  useEffect(() => {
    queryClient.setQueryData(['entries', 'demo', 'all'], demoData.demoEntries)
  }, [queryClient, demoData.demoEntries])

  const value: DemoContextValue = {
    isDemo: true,
    ...demoData,
  }

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}
