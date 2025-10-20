import React from 'react'
import { EnhancedErrorBoundary } from './EnhancedErrorBoundary'
import {
  ErrorBoundaryConfig,
  ErrorContext,
} from '../contexts/ErrorBoundaryContext'
import { PageErrorFallback } from './fallbacks/PageErrorFallback'

interface PageErrorBoundaryProps {
  children: React.ReactNode
  pageName?: string
  contextData?: Partial<ErrorContext>
}

export const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({
  children,
  pageName,
  contextData,
}) => {
  const config: ErrorBoundaryConfig = {
    level: 'page',
    name: pageName,
    retryable: true,
    showErrorDetails: process.env.NODE_ENV === 'development',
    fallbackComponent: PageErrorFallback,
  }

  return (
    <EnhancedErrorBoundary config={config} contextData={contextData}>
      {children}
    </EnhancedErrorBoundary>
  )
}
