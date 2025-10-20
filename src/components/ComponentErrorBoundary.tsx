import React from 'react'
import { EnhancedErrorBoundary } from './EnhancedErrorBoundary'
import {
  ErrorBoundaryConfig,
  ErrorContext,
} from '../contexts/ErrorBoundaryContext'
import { ComponentErrorFallback } from './fallbacks/ComponentErrorFallback'

interface ComponentErrorBoundaryProps {
  children: React.ReactNode
  componentName?: string
  contextData?: Partial<ErrorContext>
  retryable?: boolean
}

export const ComponentErrorBoundary: React.FC<ComponentErrorBoundaryProps> = ({
  children,
  componentName,
  contextData,
  retryable = true,
}) => {
  const config: ErrorBoundaryConfig = {
    level: 'component',
    name: componentName,
    retryable,
    showErrorDetails: process.env.NODE_ENV === 'development',
    fallbackComponent: ComponentErrorFallback,
  }

  return (
    <EnhancedErrorBoundary config={config} contextData={contextData}>
      {children}
    </EnhancedErrorBoundary>
  )
}
