import React from 'react'
import { QuickEntryModal } from './QuickEntryModal'

interface QuickDiaperModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  onError: (error: string) => void
  babyId: string
}

export const QuickDiaperModal: React.FC<QuickDiaperModalProps> = (props) => {
  return <QuickEntryModal {...props} entryType='diaper' />
}
