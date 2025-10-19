import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Call the optional error handler
    this.props.onError?.(error, errorInfo)

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className='flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900'>
          <Card className='w-full max-w-lg'>
            <div className='space-y-6 text-center'>
              <div className='flex justify-center'>
                <div className='rounded-full bg-red-100 p-3 dark:bg-red-900/30'>
                  <AlertTriangle className='h-8 w-8 text-red-600 dark:text-red-400' />
                </div>
              </div>

              <div>
                <h1 className='mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100'>
                  Oops! Something went wrong
                </h1>
                <p className='text-gray-600 dark:text-gray-400'>
                  We encountered an unexpected error. Don't worry, your data is
                  safe.
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className='text-left'>
                  <details className='rounded-lg bg-gray-100 p-4 dark:bg-gray-800'>
                    <summary className='mb-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Error Details (Development)
                    </summary>
                    <div className='font-mono text-xs break-all whitespace-pre-wrap text-red-600 dark:text-red-400'>
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </div>
                  </details>
                </div>
              )}

              <div className='flex gap-3'>
                <Button
                  onClick={this.handleRetry}
                  variant='outline'
                  className='flex-1'
                  leftIcon={<RefreshCw />}
                >
                  Try Again
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  className='flex-1'
                  leftIcon={<Home />}
                >
                  Go Home
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
