import { TourStep } from '../contexts/TourContext'

// Tour step data structure for configuration
export interface TourStepData {
  id: string
  target: string
  title: string
  content: string
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center'
  order: number
  isOptional: boolean
  requiredFeatures?: string[]
}

// Main onboarding tour steps configuration
export const ONBOARDING_TOUR_STEPS: TourStepData[] = [
  {
    id: 'welcome',
    target: '[data-tour="app-header"]',
    title: 'Welcome to Lilybug!',
    content:
      "Let's take a quick tour to help you get started with tracking your baby's activities.",
    placement: 'bottom',
    order: 1,
    isOptional: false,
  },
  {
    id: 'logo-navigation',
    target: '[data-tour="app-logo"]',
    title: 'Your Baby Care Hub',
    content:
      'This is your Lilybug dashboard. Click the logo anytime to return to the main view.',
    placement: 'bottom',
    order: 2,
    isOptional: false,
  },
  {
    id: 'baby-info',
    target: '[data-tour="baby-info"]',
    title: 'Baby Information',
    content:
      "Here you can see your baby's information and switch between multiple babies if you have them.",
    placement: 'bottom',
    order: 3,
    isOptional: false,
  },
  {
    id: 'user-menu',
    target: '[data-tour="user-dropdown"]',
    title: 'User Menu',
    content:
      'Access your account settings, manage babies, and sign out from this menu.',
    placement: 'bottom',
    order: 4,
    isOptional: false,
  },
  {
    id: 'activity-tracking',
    target: '[data-tour="activity-footer"]',
    title: 'Quick Activity Tracking',
    content:
      'Use these buttons to quickly log feeding, diaper changes, sleep, and other activities.',
    placement: 'top',
    order: 5,
    isOptional: false,
  },
  {
    id: 'activity-list',
    target: '[data-tour="activity-list"]',
    title: 'Activity History',
    content:
      "View and manage all your baby's recorded activities here. You can edit or delete entries as needed.",
    placement: 'top',
    order: 6,
    isOptional: false,
  },
  {
    id: 'settings-access',
    target: '[data-tour="settings-link"]',
    title: 'Settings & Preferences',
    content:
      'Customize your experience, manage babies, and adjust app preferences in the settings.',
    placement: 'left',
    order: 7,
    isOptional: false,
  },
]

// Convert tour step data to React Joyride format
export const convertToJoyrideSteps = (stepData: TourStepData[]): TourStep[] => {
  return stepData
    .sort((a, b) => a.order - b.order)
    .map((step) => ({
      target: step.target,
      title: step.title,
      content: step.content,
      placement: step.placement,
      disableBeacon: false,
      hideCloseButton: false,
      hideFooter: false,
    }))
}

// Get filtered steps based on available features
export const getAvailableTourSteps = (
  stepData: TourStepData[] = ONBOARDING_TOUR_STEPS,
  availableFeatures: string[] = []
): TourStep[] => {
  const filteredSteps = stepData.filter((step) => {
    // If step has required features, check if they're available
    if (step.requiredFeatures && step.requiredFeatures.length > 0) {
      return step.requiredFeatures.every((feature) =>
        availableFeatures.includes(feature)
      )
    }
    return true
  })

  return convertToJoyrideSteps(filteredSteps)
}

// Default tour configuration
export const DEFAULT_TOUR_CONFIG = {
  continuous: true,
  showProgress: true,
  showSkipButton: true,
  spotlightClicks: true,
  disableOverlayClose: false,
  disableScrollParentFix: false,
  hideBackButton: false,
  styles: {
    options: {
      primaryColor: '#3b82f6', // Blue-500 to match Lilybug theme
      textColor: '#374151', // Gray-700
      backgroundColor: '#ffffff',
      overlayColor: 'rgba(0, 0, 0, 0.5)',
      spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
      width: 350,
      zIndex: 10000,
    },
    tooltip: {
      borderRadius: '8px',
      padding: '16px',
    },
    tooltipContainer: {
      textAlign: 'left' as const,
    },
    tooltipTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '8px',
    },
    tooltipContent: {
      fontSize: '14px',
      lineHeight: '1.5',
    },
    buttonNext: {
      backgroundColor: '#3b82f6',
      borderRadius: '6px',
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: '500',
    },
    buttonBack: {
      color: '#6b7280',
      marginRight: '8px',
      padding: '8px 16px',
      fontSize: '14px',
    },
    buttonSkip: {
      color: '#6b7280',
      fontSize: '14px',
    },
  },
  locale: {
    back: 'Back',
    close: 'Close',
    last: 'Finish',
    next: 'Next',
    skip: 'Skip tour',
  },
}

export type { TourStep }
