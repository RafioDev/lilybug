import { Component, ErrorInfo, ReactNode } from 'react'
import {
  ErrorBoundaryConfig,
  ErrorContext,
  ErrorBoundaryState,
} from '../contexts/ErrorBoundaryContext'
import {
  errorBoundaryReporter,
  createErrorContext,
  shouldRetry,
  getRetryDelay,
} from '../utils/errorBoundaryUtils'

interface EnhancedErrorBoundaryProps {
  children: ReactNode
  config: ErrorBoundaryConfig
  contextData?: Partial<ErrorContext>
}

export class EnhancedErrorBoundary extends Component<
  EnhancedErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: EnhancedErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      lastRetryTime: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { config, contextData } = this.props

    // Create error context
    const context = createErrorContext(config.level, config.name, contextData)

    // Generate error ID and report
    const errorId = errorBoundaryReporter.reportError(
      error,
      errorInfo,
      context,
      this.state.retryCount
    )

    // Update state with error details
    this.setState({
      error,
      errorInfo,
      errorId,
    })

    // Call custom error handler if provided
    config.onError?.(error, errorInfo, context)
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  handleRetry = () => {
    const { config } = this.props
    const { error, retryCount } = this.state

    if (!error) return

    // Check if retry is allowed
    const maxRetries = 3 // Default max retries
    if (!shouldRetry(error, retryCount, maxRetries, config.level)) {
      return
    }

    // Calculate retry delay
    const delay = getRetryDelay(retryCount)

    // Clear any existing timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }

    // Set retry timeout
    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: '',
        retryCount: retryCount + 1,
        lastRetryTime: new Date(),
      })
    }, delay)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      lastRetryTime: null,
    })
  }

  render() {
    const { children, config } = this.props
    const { hasError, error, errorInfo } = this.state

    if (hasError && error) {
      // Use custom fallback component if provided
      if (config.fallbackComponent) {
        const FallbackComponent = config.fallbackComponent
        const context = createErrorContext(
          config.level,
          config.name,
          this.props.contextData
        )

        return (
          <FallbackComponent
            error={error}
            errorInfo={errorInfo}
            resetError={this.handleReset}
            config={config}
            context={context}
          />
        )
      }

      // Default fallback based on level will be handled by specialized components
      return (
        <div className='error-boundary-fallback'>
          <p>Something went wrong in {config.name || config.level}</p>
          <button onClick={this.handleRetry}>Retry</button>
          <button onClick={this.handleReset}>Reset</button>
        </div>
      )
    }

    return children
  }
}
