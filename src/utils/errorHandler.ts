/**
 * Global error handling utilities
 */

export interface ErrorReport {
  message: string
  stack?: string
  timestamp: Date
  url: string
  userAgent: string
  userId?: string
  context?: Record<string, unknown>
}

class ErrorHandler {
  private errorQueue: ErrorReport[] = []
  private isOnline = navigator.onLine

  constructor() {
    this.setupGlobalHandlers()
    this.setupNetworkHandlers()
  }

  private setupGlobalHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)

      this.captureError(
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason)),
        { type: 'unhandledrejection' }
      )

      // Prevent the default browser behavior (logging to console)
      event.preventDefault()
    })

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error)

      this.captureError(event.error || new Error(event.message), {
        type: 'javascript',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    })
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

  captureError(error: Error, context?: Record<string, unknown>) {
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      context,
    }

    // Add to queue for offline handling
    this.errorQueue.push(errorReport)

    // Try to send immediately if online
    if (this.isOnline) {
      this.flushErrorQueue()
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Captured')
      console.error('Error:', error)
      console.log('Context:', context)
      console.log('Report:', errorReport)
      console.groupEnd()
    }
  }

  private async flushErrorQueue() {
    if (this.errorQueue.length === 0) return

    const errors = [...this.errorQueue]
    this.errorQueue = []

    try {
      // Here you would send to your error reporting service
      // Example: await errorReportingService.send(errors)

      // For now, just log that we would send them
      console.log('Would send error reports:', errors)
    } catch (sendError) {
      // If sending fails, put errors back in queue
      this.errorQueue.unshift(...errors)
      console.error('Failed to send error reports:', sendError)
    }
  }

  // Method to manually report errors from components
  reportError(error: Error | string, context?: Record<string, unknown>) {
    const errorObj = error instanceof Error ? error : new Error(error)
    this.captureError(errorObj, context)
  }

  // Method to clear error queue (useful for testing)
  clearQueue() {
    this.errorQueue = []
  }
}

// Create singleton instance
export const errorHandler = new ErrorHandler()

// Convenience function for manual error reporting
export const reportError = (
  error: Error | string,
  context?: Record<string, unknown>
) => {
  errorHandler.reportError(error, context)
}

// React error boundary integration
export const handleReactError = (error: Error, errorInfo: React.ErrorInfo) => {
  errorHandler.captureError(error, {
    type: 'react-error-boundary',
    componentStack: errorInfo.componentStack,
  })
}
