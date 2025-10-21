import React from 'react'
import { Baby, Moon, Droplets } from 'lucide-react'
import type { EntryType } from '../types'

export interface QuickAction {
  id: EntryType
  icon: React.ReactNode
  label: string
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  action: () => void
}

// Default quick actions for baby tracking
const DEFAULT_QUICK_ACTIONS: Omit<QuickAction, 'action'>[] = [
  {
    id: 'feeding',
    icon: <Baby className='h-5 w-5' />,
    label: 'Feeding',
    color: 'success',
  },
  {
    id: 'diaper',
    icon: <Droplets className='h-5 w-5' />,
    label: 'Diaper',
    color: 'warning',
  },
  {
    id: 'sleep',
    icon: <Moon className='h-5 w-5' />,
    label: 'Sleep',
    color: 'secondary',
  },
]

export const createDefaultQuickActions = (
  onFeeding: () => void,
  onDiaper: () => void,
  onSleep: () => void
): QuickAction[] => {
  return DEFAULT_QUICK_ACTIONS.map((action) => ({
    ...action,
    action:
      action.id === 'feeding'
        ? onFeeding
        : action.id === 'diaper'
          ? onDiaper
          : onSleep,
  }))
}
