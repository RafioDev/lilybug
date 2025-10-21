import React from 'react'
import { QuickEntryModal } from './QuickEntryModal'

interface QuickSleepModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  onError: (error: string) => void
  babyId: string
}

export const QuickSleepModal: React.FC<QuickSleepModalProps> = (props) => {
  return <QuickEntryModal {...props} entryType='sleep' />
}
