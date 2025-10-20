import { ErrorInfo } from 'react'
import {
  ErrorContext,
  ErrorBoundaryLevel,
  ErrorReport,
} from '../contexts/ErrorBoundaryContext'

/**
 * Enhanced error reporting utilities for error boundaries
 */

export class ErrorBoundaryReporter {
  private static instance: ErrorBoundaryReporter
  private errorQueue: ErrorReport[] = []
  private isOnline = navigator.onLine

  private constructor() {
    this.setupNetworkHandlers()
  }

  static getInstance(): ErrorBoundaryReporter {
    if (!ErrorBoundaryReporter.instance) {
      ErrorBoundaryReporter.instance = new ErrorBoundaryReporter()
    }
    return ErrorBoundaryReporter.instance
  }

  private setupNetworkHandlers() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.flushErrorQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  reportError(
    error: Error,
    errorInfo: ErrorInfo,
    context: ErrorContext,
    retryCount = 0
  ): string {
    const errorId = `eb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const report: ErrorReport = {
      id: errorId,
      level: context.level,
      componentName: context.name,
      error: {
        message: error.message,
        stack: error.stack || '',
        name: error.name,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack || '',
      },
      context,
      timestamp: new Date(),
      resolved: false,
      retryCount,
    }

    // Add to queue for offline handling
    this.errorQueue.push(report)

    // Try to send immediately if online
    if (this.isOnline) {
      this.flushErrorQueue()
    }

    // Log based on environment and level
    this.logError(report)

    return errorId
  }

  private logError(report: ErrorReport) {
    const isDevelopment = process.env.NODE_ENV === 'development'
    const isProduction = process.env.NODE_ENV === 'production'

    if (isDevelopment) {
      // Detailed logging in development
      console.group(
        `🚨 Error Boundary [${report.level}${report.componentName ? ` - ${report.componentName}` : ''}]`
      )
      console.error('Error:', report.error.message)
      console.log('Stack:', report.error.stack)
      console.log('Component Stack:', report.errorInfo.componentStack)
      console.log('Context:', report.context)
      console.log('Retry Count:', report.retryCount)
      console.groupEnd()
    } else if (isProduction) {
      // Minimal logging in production
      console.error(`Error Boundary [${report.level}]:`, report.error.message)
    }
  }

  private async flushErrorQueue() {
    if (this.errorQueue.length === 0) return

    const errors = [...this.errorQueue]
    this.errorQueue = []

    try {
      // In a real application, you would send to your error reporting service
      // Example integrations:
      // - Sentry: Sentry.captureException(error, { contexts: { errorBoundary: context } })
      // - LogRocket: LogRocket.captureException(error)
      // - Custom API: await fetch('/api/errors', { method: 'POST', body: JSON.stringify(errors) })

      if (process.env.NODE_ENV === 'development') {
        console.log(
          '📤 Would send error reports to monitoring service:',
          errors.length
        )
      }

      // Simulate API call delay in development
      if (process.env.NODE_ENV === 'development') {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    } catch (sendError) {
      // If sending fails, put errors back in queue
      this.errorQueue.unshift(...errors)
      console.error('Failed to send error reports:', sendError)
    }
  }

  clearQueue() {
    this.errorQueue = []
  }

  getQueuedErrors(): ErrorReport[] {
    return [...this.errorQueue]
  }
}

/**
 * Utility functions for error boundary operations
 */

export const createErrorContext = (
  level: ErrorBoundaryLevel,
  name?: string,
  additionalContext?: Partial<ErrorContext>
): ErrorContext => {
  return {
    level,
    name,
    timestamp: new Date(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...additionalContext,
  }
}

export const shouldRetry = (
  error: Error,
  retryCount: number,
  maxRetries: number,
  level: ErrorBoundaryLevel
): boolean => {
  // Don't retry certain types of errors
  const nonRetryableErrors = [
    'ChunkLoadError', // Webpack chunk loading errors
    'TypeError', // Usually code errors that won't resolve with retry
    'ReferenceError', // Code errors
    'SyntaxError', // Code errors
  ]

  if (nonRetryableErrors.includes(error.name)) {
    return false
  }

  // Different retry limits based on level
  const levelMaxRetries = {
    app: 1, // App-level errors should rarely retry
    page: 2, // Page-level errors can retry a couple times
    section: 3, // Section-level errors can retry more
    component: maxRetries, // Component-level errors use full retry count
    modal: 2, // Modal errors should retry minimally
  }

  return retryCount < (levelMaxRetries[level] || maxRetries)
}

export const getRetryDelay = (retryCount: number): number => {
  // Exponential backoff with jitter
  const baseDelay = 1000 // 1 second
  const maxDelay = 10000 // 10 seconds
  const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay)
  const jitter = Math.random() * 0.1 * delay
  return delay + jitter
}

export const formatErrorForUser = (
  level: ErrorBoundaryLevel,
  componentName?: string
): string => {
  const levelMessages = {
    app: 'The application encountered an unexpected error.',
    page: 'This page encountered an error and cannot be displayed.',
    section: `The ${componentName || 'section'} encountered an error.`,
    component: `The ${componentName || 'component'} failed to load.`,
    modal: `The ${componentName || 'dialog'} encountered an error.`,
  }

  return levelMessages[level] || 'An unexpected error occurred.'
}

// Singleton instance
export const errorBoundaryReporter = ErrorBoundaryReporter.getInstance()
