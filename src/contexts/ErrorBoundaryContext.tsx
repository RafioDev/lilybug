import React, { createContext, useContext, ReactNode, ErrorInfo } from 'react'

export type ErrorBoundaryLevel =
  | 'app'
  | 'page'
  | 'section'
  | 'component'
  | 'modal'

export interface ErrorContext {
  level: ErrorBoundaryLevel
  name?: string
  timestamp: Date
  userAgent: string
  url: string
  userId?: string
  babyId?: string
}

export interface ErrorBoundaryConfig {
  level: ErrorBoundaryLevel
  name?: string
  fallbackComponent?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: ErrorInfo, context: ErrorContext) => void
  retryable?: boolean
  showErrorDetails?: boolean
}

export interface ErrorFallbackProps {
  error: Error
  errorInfo: ErrorInfo | null
  resetError: () => void
  config: ErrorBoundaryConfig
  context: ErrorContext
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
  retryCount: number
  lastRetryTime: Date | null
}

export interface ErrorReport {
  id: string
  level: ErrorBoundaryLevel
  componentName?: string
  error: {
    message: string
    stack?: string
    name: string
  }
  errorInfo: {
    componentStack: string
  }
  context: ErrorContext
  timestamp: Date
  resolved: boolean
  retryCount: number
}

interface ErrorBoundaryContextValue {
  reportError: (error: Error, context: Partial<ErrorContext>) => void
  clearError: (errorId: string) => void
  getErrorReports: () => ErrorReport[]
  config: {
    enableErrorReporting: boolean
    maxRetryCount: number
    showErrorDetails: boolean
    enableDevelopmentMode: boolean
  }
}

const ErrorBoundaryContext = createContext<ErrorBoundaryContextValue | null>(
  null
)

interface ErrorBoundaryProviderProps {
  children: ReactNode
  enableErrorReporting?: boolean
  maxRetryCount?: number
  showErrorDetails?: boolean
  onError?: (report: ErrorReport) => void
}

export const ErrorBoundaryProvider: React.FC<ErrorBoundaryProviderProps> = ({
  children,
  enableErrorReporting = true,
  maxRetryCount = 3,
  showErrorDetails = process.env.NODE_ENV === 'development',
  onError,
}) => {
  const [errorReports, setErrorReports] = React.useState<ErrorReport[]>([])

  const reportError = React.useCallback(
    (error: Error, contextData: Partial<ErrorContext>) => {
      const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const context: ErrorContext = {
        level: contextData.level || 'component',
        name: contextData.name,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: contextData.userId,
        babyId: contextData.babyId,
      }

      const report: ErrorReport = {
        id: errorId,
        level: context.level,
        componentName: context.name,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
        errorInfo: {
          componentStack: '', // Will be populated by error boundary
        },
        context,
        timestamp: new Date(),
        resolved: false,
        retryCount: 0,
      }

      setErrorReports((prev) => [...prev, report])

      // Call external error handler if provided
      onError?.(report)

      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.group(`🚨 Error Boundary Report [${context.level}]`)
        console.error('Error:', error)
        console.log('Context:', context)
        console.log('Report ID:', errorId)
        console.groupEnd()
      }

      return errorId
    },
    [onError]
  )

  const clearError = React.useCallback((errorId: string) => {
    setErrorReports((prev) =>
      prev.map((report) =>
        report.id === errorId ? { ...report, resolved: true } : report
      )
    )
  }, [])

  const getErrorReports = React.useCallback(() => {
    return errorReports.filter((report) => !report.resolved)
  }, [errorReports])

  const contextValue: ErrorBoundaryContextValue = {
    reportError,
    clearError,
    getErrorReports,
    config: {
      enableErrorReporting,
      maxRetryCount,
      showErrorDetails,
      enableDevelopmentMode: process.env.NODE_ENV === 'development',
    },
  }

  return (
    <ErrorBoundaryContext.Provider value={contextValue}>
      {children}
    </ErrorBoundaryContext.Provider>
  )
}

export const useErrorBoundaryContext = (): ErrorBoundaryContextValue => {
  const context = useContext(ErrorBoundaryContext)
  if (!context) {
    throw new Error(
      'useErrorBoundaryContext must be used within an ErrorBoundaryProvider'
    )
  }
  return context
}

// Enhanced useErrorBoundary hook that integrates with the context
export const useErrorBoundary = () => {
  const context = useErrorBoundaryContext()
  const [, setError] = React.useState<Error | null>(null)

  const captureError = React.useCallback(
    (error: Error | string, contextData?: Partial<ErrorContext>) => {
      const errorObj = error instanceof Error ? error : new Error(error)

      // Report to context
      const errorId = context.reportError(errorObj, contextData || {})

      // Trigger error boundary by throwing in render
      setError(() => {
        throw errorObj
      })

      return errorId
    },
    [context, setError]
  )

  return {
    captureError,
    reportError: context.reportError,
    clearError: context.clearError,
    getErrorReports: context.getErrorReports,
  }
}
