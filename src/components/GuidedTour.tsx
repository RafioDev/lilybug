import React, { useCallback, useMemo } from 'react'
import Joyride, { CallBackProps, STATUS, EVENTS, Step } from 'react-joyride'
import { useTour } from '../contexts/TourContext'
import { useTheme } from '../contexts/ThemeContext'
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

  const { theme } = useTheme()

  // Use prop steps if provided, otherwise use context steps
  const steps = propSteps || contextSteps

  // Determine if we're in dark mode
  const isDarkMode =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  // Enhanced configuration with Lilybug design system integration and dark mode support
  const tourConfig = useMemo(
    () => ({
      ...DEFAULT_TOUR_CONFIG,
      locale: {
        ...DEFAULT_TOUR_CONFIG.locale,
        next: 'Next',
        last: 'Finish Tour',
        skip: 'Skip Tour',
        back: 'Previous',
        close: 'Close',
      },
      styles: {
        ...DEFAULT_TOUR_CONFIG.styles,
        options: {
          ...DEFAULT_TOUR_CONFIG.styles.options,
          // Theme-aware styling
          primaryColor: '#3b82f6', // Blue-500
          textColor: isDarkMode ? '#f9fafb' : '#1f2937', // Gray-50 : Gray-800
          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', // Gray-800 : White
          overlayColor: isDarkMode
            ? 'rgba(0, 0, 0, 0.6)'
            : 'rgba(0, 0, 0, 0.4)',
          spotlightShadow: isDarkMode
            ? '0 0 20px rgba(59, 130, 246, 0.4)'
            : '0 0 20px rgba(59, 130, 246, 0.3)',
          width: 380,
          zIndex: 10000,
          arrowColor: isDarkMode ? '#1f2937' : '#ffffff', // Match background
        },
        tooltip: {
          ...DEFAULT_TOUR_CONFIG.styles.tooltip,
          borderRadius: '12px',
          padding: '20px', // Restore default padding
          boxShadow: isDarkMode
            ? '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
            : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', // Gray-800 : White
        },
        tooltipContainer: {
          textAlign: 'left' as const,
        },
        tooltipTitle: {
          fontSize: '20px',
          fontWeight: '600',
          color: isDarkMode ? '#f9fafb' : '#1f2937', // Gray-50 : Gray-800
          lineHeight: '1.3',
        },
        tooltipContent: {
          fontSize: '15px',
          lineHeight: '1.6',
          color: isDarkMode ? '#d1d5db' : '#4b5563', // Gray-300 : Gray-600
          padding: '20px 0',
        },
        tooltipFooter: {
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
          color: isDarkMode ? '#9ca3af' : '#6b7280', // Gray-400 : Gray-500
          backgroundColor: 'transparent',
          border: isDarkMode ? '1px solid #4b5563' : '1px solid #d1d5db', // Gray-600 : Gray-300
          borderRadius: '8px',
          padding: '10px 16px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          marginRight: '12px',
          transition: 'all 0.2s ease',
        },
        buttonSkip: {
          color: isDarkMode ? '#9ca3af' : '#6b7280', // Gray-400 : Gray-500
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
        // Fix arrow border issue by ensuring seamless connection
        arrow: {
          color: isDarkMode ? '#1f2937' : '#ffffff', // Match tooltip background
        },
      },
    }),
    [isDarkMode]
  )

  // Generate dynamic CSS that depends on current step
  const dynamicCSS = useMemo(
    () => `
    /* Fix arrow positioning and make it seamless with modal */
    .__floater__arrow {
      z-index: 10001 !important;
    }

    /* Make arrow seamless with modal background */
    .__floater__arrow polygon {
      fill: ${isDarkMode ? '#1f2937' : '#ffffff'} !important;
      stroke: ${isDarkMode ? '#1f2937' : '#ffffff'} !important;
      stroke-width: 0 !important;
    }

    /* Ensure tooltip has proper styling */
    .react-joyride__tooltip {
      filter: drop-shadow(${
        isDarkMode
          ? '0 10px 25px rgba(0, 0, 0, 0.4)'
          : '0 10px 25px rgba(0, 0, 0, 0.1)'
      });
    }

    /* Add progress indicator after title */
    .react-joyride__tooltip h1:after {
      content: "STEP ${currentStep + 1} OF ${steps.length}";
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: ${isDarkMode ? '#9ca3af' : '#6b7280'};
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Enhanced button hover states */
    .react-joyride__tooltip button[data-action="primary"]:hover {
      background-color: #2563eb !important;
      transform: translateY(-1px);
    }

    .react-joyride__tooltip button[data-action="back"]:hover {
      background-color: ${isDarkMode ? '#374151' : '#f9fafb'} !important;
      border-color: ${isDarkMode ? '#6b7280' : '#9ca3af'} !important;
    }

    .react-joyride__tooltip button[data-action="skip"]:hover {
      color: ${isDarkMode ? '#d1d5db' : '#374151'} !important;
    }

    /* Smooth transitions for all buttons */
    .react-joyride__tooltip button {
      transition: all 0.2s ease !important;
    }
  `,
    [isDarkMode, currentStep, steps.length]
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
      {/* Custom styles to fix arrow border issues */}
      <style>{dynamicCSS}</style>
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
