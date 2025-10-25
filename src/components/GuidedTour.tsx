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
    nextStep,
    prevStep,
    skipTour,
    markTourCompleted,
    endTour,
  } = useTour()

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { status, type, index } = data

      // Handle tour completion
      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        if (status === STATUS.FINISHED) {
          markTourCompleted()
        } else {
          skipTour()
        }
        return
      }

      // Handle step navigation
      if (type === EVENTS.STEP_AFTER) {
        if (index < steps.length - 1) {
          nextStep()
        } else {
          markTourCompleted()
        }
      } else if (type === EVENTS.STEP_BEFORE && index > 0) {
        prevStep()
      }

      // Handle tour close
      if (type === EVENTS.TOUR_END) {
        endTour()
      }
    },
    [steps.length, nextStep, prevStep, skipTour, markTourCompleted, endTour]
  )

  if (!isActive || steps.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <Joyride
        steps={steps}
        stepIndex={currentStep}
        run={isActive}
        continuous={DEFAULT_TOUR_CONFIG.continuous}
        showProgress={DEFAULT_TOUR_CONFIG.showProgress}
        showSkipButton={DEFAULT_TOUR_CONFIG.showSkipButton}
        spotlightClicks={DEFAULT_TOUR_CONFIG.spotlightClicks}
        disableOverlayClose={DEFAULT_TOUR_CONFIG.disableOverlayClose}
        disableScrollParentFix={DEFAULT_TOUR_CONFIG.disableScrollParentFix}
        hideBackButton={DEFAULT_TOUR_CONFIG.hideBackButton}
        styles={DEFAULT_TOUR_CONFIG.styles}
        locale={DEFAULT_TOUR_CONFIG.locale}
        callback={handleJoyrideCallback}
      />
    </div>
  )
}

export default GuidedTour
