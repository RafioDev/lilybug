import React from 'react'
import { EnhancedErrorBoundary } from './EnhancedErrorBoundary'
import {
  ErrorBoundaryConfig,
  ErrorContext,
  ErrorFallbackProps,
} from '../contexts/ErrorBoundaryContext'
import { ModalErrorFallback } from './fallbacks/ModalErrorFallback'

interface ModalErrorBoundaryProps {
  children: React.ReactNode
  modalName?: string
  contextData?: Partial<ErrorContext>
  onClose?: () => void
}

export const ModalErrorBoundary: React.FC<ModalErrorBoundaryProps> = ({
  children,
  modalName,
  contextData,
  onClose,
}) => {
  // Create a custom fallback component that includes the onClose prop
  const ModalFallbackWithClose = React.useCallback(
    (props: ErrorFallbackProps) => (
      <ModalErrorFallback {...props} onClose={onClose} />
    ),
    [onClose]
  )

  const config: ErrorBoundaryConfig = {
    level: 'modal',
    name: modalName,
    retryable: true,
    showErrorDetails: process.env.NODE_ENV === 'development',
    fallbackComponent: ModalFallbackWithClose,
    onError: (error, errorInfo, context) => {
      // Modal-specific error handling
      console.error(`Modal error in ${modalName}:`, error, errorInfo, context)

      // Optionally close modal on critical errors
      if (error.name === 'ChunkLoadError' || error.name === 'TypeError') {
        onClose?.()
      }
    },
  }

  return (
    <EnhancedErrorBoundary config={config} contextData={contextData}>
      {children}
    </EnhancedErrorBoundary>
  )
}
