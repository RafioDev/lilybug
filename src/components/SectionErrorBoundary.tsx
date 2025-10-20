import React from 'react'
import { EnhancedErrorBoundary } from './EnhancedErrorBoundary'
import {
  ErrorBoundaryConfig,
  ErrorContext,
} from '../contexts/ErrorBoundaryContext'
import { SectionErrorFallback } from './fallbacks/SectionErrorFallback'

interface SectionErrorBoundaryProps {
  children: React.ReactNode
  sectionName?: string
  contextData?: Partial<ErrorContext>
}

export const SectionErrorBoundary: React.FC<SectionErrorBoundaryProps> = ({
  children,
  sectionName,
  contextData,
}) => {
  const config: ErrorBoundaryConfig = {
    level: 'section',
    name: sectionName,
    retryable: true,
    showErrorDetails: process.env.NODE_ENV === 'development',
    fallbackComponent: SectionErrorFallback,
  }

  return (
    <EnhancedErrorBoundary config={config} contextData={contextData}>
      {children}
    </EnhancedErrorBoundary>
  )
}
