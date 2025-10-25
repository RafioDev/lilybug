import React, { useCallback } from 'react'
import Joyride, { CallBackProps, STATUS, EVENTS } from 'react-joyride'
import { useTour } from '../contexts/TourContext'
import { DEFAULT_TOUR_CONFIG } from '../config/tourSteps'

interface GuidedTourProps {
  className?: string
}

export const GuidedTour: React.FC<GuidedTourProps> = ({ className }) => {
  const {
    isActive,
    currentStep,
    steps,
    skipTour,
    markTourCompleted,
    endTour,
    setCurrentStep,
  } = useTour()

  // Create custom configuration with correct step numbering
  const customConfig = {
    ...DEFAULT_TOUR_CONFIG,
    locale: {
      ...DEFAULT_TOUR_CONFIG.locale,
      next: `Next (Step ${currentStep + 2} of ${steps.length})`,
      last: 'Finish',
    },
  }

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { status, type, index } = data

      // Update current step index for display purposes only
      if (typeof index === 'number') {
        setCurrentStep(index)
      }

      // Handle tour completion
      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        if (status === STATUS.FINISHED) {
          markTourCompleted()
        } else {
          skipTour()
        }
        return
      }

      // Handle tour close
      if (type === EVENTS.TOUR_END) {
        endTour()
      }
    },
    [skipTour, markTourCompleted, endTour, setCurrentStep]
  )

  if (!isActive || steps.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <Joyride
        steps={steps}
        run={isActive}
        continuous={customConfig.continuous}
        showProgress={customConfig.showProgress}
        scrollToFirstStep={customConfig.scrollToFirstStep}
        scrollOffset={customConfig.scrollOffset}
        floaterProps={customConfig.floaterProps}
        showSkipButton={customConfig.showSkipButton}
        spotlightClicks={customConfig.spotlightClicks}
        disableOverlayClose={customConfig.disableOverlayClose}
        disableScrollParentFix={customConfig.disableScrollParentFix}
        hideBackButton={customConfig.hideBackButton}
        styles={customConfig.styles}
        locale={customConfig.locale}
        callback={handleJoyrideCallback}
      />
    </div>
  )
}

export default GuidedTour
