import React from 'react'
import { QuickEntryModal } from './QuickEntryModal'

interface QuickFeedingModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  onError: (error: string) => void
  babyId: string
}

export const QuickFeedingModal: React.FC<QuickFeedingModalProps> = (props) => {
  return <QuickEntryModal {...props} entryType='feeding' />
}
