import React, { useCallback, useMemo } from 'react'
import Joyride, { CallBackProps, STATUS, EVENTS, Step } from 'react-joyride'
import { useTour } from '../contexts/TourContext'
import { DEFAULT_TOUR_CONFIG } from '../config/tourSteps'

interface GuidedTourProps {
  className?: string
  steps?: Step[]
  onTourEnd?: () => void
  onStepChange?: (stepIndex: number) => void
}

export const GuidedTour: React.FC<GuidedTourProps> = ({
  className,
  steps: propSteps,
  onTourEnd,
  onStepChange,
}) => {
  const {
    isActive,
    currentStep,
    steps: contextSteps,
    skipTour,
    markTourCompleted,
    endTour,
    setCurrentStep,
  } = useTour()

  // Use prop steps if provided, otherwise use context steps
  const steps = propSteps || contextSteps

  // Enhanced configuration with Lilybug design system integration
  const tourConfig = useMemo(
    () => ({
      ...DEFAULT_TOUR_CONFIG,
      locale: {
        ...DEFAULT_TOUR_CONFIG.locale,
        next:
          steps.length > 1
            ? `Next (${currentStep + 1} of ${steps.length})`
            : 'Next',
        last: 'Finish Tour',
        skip: 'Skip Tour',
        back: 'Previous',
        close: 'Close',
      },
      styles: {
        ...DEFAULT_TOUR_CONFIG.styles,
        options: {
          ...DEFAULT_TOUR_CONFIG.styles.options,
          // Enhanced styling for Lilybug design system
          primaryColor: '#3b82f6', // Blue-500
          textColor: '#1f2937', // Gray-800
          backgroundColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.4)',
          spotlightShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
          width: 380,
          zIndex: 10000,
          arrowColor: '#ffffff',
        },
        tooltip: {
          ...DEFAULT_TOUR_CONFIG.styles.tooltip,
          borderRadius: '12px',
          padding: '20px',
          boxShadow:
            '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e5e7eb',
        },
        tooltipContainer: {
          textAlign: 'left' as const,
        },
        tooltipTitle: {
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '12px',
          color: '#1f2937',
          lineHeight: '1.3',
        },
        tooltipContent: {
          fontSize: '15px',
          lineHeight: '1.6',
          color: '#4b5563',
          marginBottom: '16px',
        },
        tooltipFooter: {
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        buttonNext: {
          backgroundColor: '#3b82f6',
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#ffffff',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease',
        },
        buttonBack: {
          color: '#6b7280',
          backgroundColor: 'transparent',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          padding: '10px 16px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          marginRight: '12px',
          transition: 'all 0.2s ease',
        },
        buttonSkip: {
          color: '#6b7280',
          backgroundColor: 'transparent',
          border: 'none',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          padding: '8px',
          transition: 'color 0.2s ease',
        },
        spotlight: {
          borderRadius: '8px',
        },
      },
    }),
    [currentStep, steps.length]
  )

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { status, type, index, action } = data

      // Log tour interaction for debugging
      if (process.env.NODE_ENV === 'development') {
        console.debug('Tour interaction:', { status, type, index, action })
      }

      // Update current step index for display purposes and track step views
      if (typeof index === 'number' && index !== currentStep) {
        setCurrentStep(index)
        onStepChange?.(index)
      }

      // Handle tour completion
      if (status === STATUS.FINISHED) {
        markTourCompleted()
        onTourEnd?.()
        return
      }

      // Handle tour skipping
      if (status === STATUS.SKIPPED) {
        skipTour()
        onTourEnd?.()
        return
      }

      // Handle tour close
      if (type === EVENTS.TOUR_END) {
        endTour()
        onTourEnd?.()
      }

      // Handle errors gracefully
      if (status === STATUS.ERROR) {
        console.warn('Tour error occurred:', data)
        endTour()
        onTourEnd?.()
      }
    },
    [
      skipTour,
      markTourCompleted,
      endTour,
      setCurrentStep,
      onTourEnd,
      onStepChange,
      currentStep,
    ]
  )

  // Don't render if tour is not active or no steps available
  if (!isActive || steps.length === 0) {
    return null
  }

  return (
    <div className={className} role='dialog' aria-label='Guided tour'>
      <Joyride
        steps={steps}
        run={isActive}
        continuous={tourConfig.continuous}
        showProgress={tourConfig.showProgress}
        scrollToFirstStep={tourConfig.scrollToFirstStep}
        scrollOffset={tourConfig.scrollOffset}
        floaterProps={{
          ...tourConfig.floaterProps,
        }}
        showSkipButton={tourConfig.showSkipButton}
        spotlightClicks={tourConfig.spotlightClicks}
        disableOverlayClose={tourConfig.disableOverlayClose}
        disableScrollParentFix={tourConfig.disableScrollParentFix}
        hideBackButton={tourConfig.hideBackButton}
        styles={tourConfig.styles}
        locale={tourConfig.locale}
        callback={handleJoyrideCallback}
        // Enhanced accessibility features
        debug={false}
        // Keyboard navigation support
        disableCloseOnEsc={false}
      />
    </div>
  )
}

export default GuidedTour
