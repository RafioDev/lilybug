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
  disableBeacon?: boolean
  hideCloseButton?: boolean
  hideFooter?: boolean
  styles?: Record<string, unknown>
}

// Tour step validation schema
export interface TourStepValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Validate a single tour step
export const validateTourStep = (
  step: TourStepData
): TourStepValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []

  // Required field validation
  if (!step.id || step.id.trim() === '') {
    errors.push('Step ID is required')
  }
  if (!step.target || step.target.trim() === '') {
    errors.push('Step target selector is required')
  }
  if (!step.title || step.title.trim() === '') {
    errors.push('Step title is required')
  }
  if (!step.content || step.content.trim() === '') {
    errors.push('Step content is required')
  }

  // Validate placement
  const validPlacements = ['top', 'bottom', 'left', 'right', 'center']
  if (!validPlacements.includes(step.placement)) {
    errors.push(
      `Invalid placement: ${step.placement}. Must be one of: ${validPlacements.join(', ')}`
    )
  }

  // Validate order
  if (typeof step.order !== 'number' || step.order < 1) {
    errors.push('Step order must be a positive number')
  }

  // Validate target selector format
  if (step.target && !step.target.startsWith('[data-tour=')) {
    warnings.push(
      'Target selector should use data-tour attributes for consistency'
    )
  }

  // Validate content length
  if (step.content && step.content.length > 200) {
    warnings.push(
      'Step content is quite long. Consider shortening for better UX'
    )
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// Validate an array of tour steps
export const validateTourSteps = (
  steps: TourStepData[]
): TourStepValidationResult => {
  const allErrors: string[] = []
  const allWarnings: string[] = []

  // Check for empty array
  if (!steps || steps.length === 0) {
    allErrors.push('At least one tour step is required')
    return { isValid: false, errors: allErrors, warnings: allWarnings }
  }

  // Validate individual steps
  steps.forEach((step, index) => {
    const validation = validateTourStep(step)
    validation.errors.forEach((error) => {
      allErrors.push(`Step ${index + 1} (${step.id || 'unknown'}): ${error}`)
    })
    validation.warnings.forEach((warning) => {
      allWarnings.push(
        `Step ${index + 1} (${step.id || 'unknown'}): ${warning}`
      )
    })
  })

  // Check for duplicate IDs
  const ids = steps.map((step) => step.id).filter(Boolean)
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index)
  if (duplicateIds.length > 0) {
    allErrors.push(`Duplicate step IDs found: ${duplicateIds.join(', ')}`)
  }

  // Check for duplicate orders
  const orders = steps.map((step) => step.order)
  const duplicateOrders = orders.filter(
    (order, index) => orders.indexOf(order) !== index
  )
  if (duplicateOrders.length > 0) {
    allWarnings.push(
      `Duplicate step orders found: ${duplicateOrders.join(', ')}`
    )
  }

  // Check for gaps in order sequence
  const sortedOrders = [...orders].sort((a, b) => a - b)
  for (let i = 1; i < sortedOrders.length; i++) {
    if (sortedOrders[i] - sortedOrders[i - 1] > 1) {
      allWarnings.push(
        `Gap in step order sequence between ${sortedOrders[i - 1]} and ${sortedOrders[i]}`
      )
    }
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  }
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
    title: 'User Menu & Settings',
    content:
      'Click here to access your account settings, manage babies, customize app preferences, and sign out.',
    placement: 'bottom',
    order: 4,
    isOptional: false,
  },
  {
    id: 'activity-tracking',
    target: '[data-tour="activity-buttons"]',
    title: 'Quick Activity Tracking',
    content:
      'Use these buttons to quickly log feeding, diaper changes, sleep, and other activities. Try the Voice Assistant for hands-free logging or New Entry for manual input.',
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
]

// Settings page tour steps
export const SETTINGS_TOUR_STEPS: TourStepData[] = [
  {
    id: 'settings-navigation',
    target: '[data-tour="settings-tabs"]',
    title: 'Settings Navigation',
    content:
      'Use these tabs to navigate between different settings categories.',
    placement: 'bottom',
    order: 1,
    isOptional: false,
  },
  {
    id: 'baby-management',
    target: '[data-tour="baby-management"]',
    title: 'Baby Management',
    content: 'Add, edit, or remove babies from your account here.',
    placement: 'top',
    order: 2,
    isOptional: false,
  },
  {
    id: 'tour-replay',
    target: '[data-tour="tour-replay"]',
    title: 'Replay Tour',
    content: 'Click here anytime to replay this guided tour.',
    placement: 'top',
    order: 3,
    isOptional: false,
  },
]

// Convert tour step data to React Joyride format with error handling
export const convertToJoyrideSteps = (stepData: TourStepData[]): TourStep[] => {
  // Validate steps before conversion
  const validation = validateTourSteps(stepData)
  if (!validation.isValid) {
    console.error('Tour steps validation failed:', validation.errors)
    // Return empty array if validation fails to prevent tour from breaking
    return []
  }

  // Log warnings if any
  if (validation.warnings.length > 0) {
    console.warn('Tour steps validation warnings:', validation.warnings)
  }

  return stepData
    .sort((a, b) => a.order - b.order)
    .map((step) => ({
      target: step.target,
      title: step.title,
      content: step.content,
      placement: step.placement,
      disableBeacon: step.disableBeacon ?? false,
      hideCloseButton: step.hideCloseButton ?? false,
      hideFooter: step.hideFooter ?? false,
      styles: step.styles,
    }))
}

// Check if target elements exist in the DOM
export const checkTargetElementsExist = (
  steps: TourStepData[]
): { [stepId: string]: boolean } => {
  const results: { [stepId: string]: boolean } = {}

  steps.forEach((step) => {
    try {
      const element = document.querySelector(step.target)
      results[step.id] = element !== null
    } catch (error) {
      console.warn(
        `Invalid selector for step ${step.id}: ${step.target}`,
        error
      )
      results[step.id] = false
    }
  })

  return results
}

// Get filtered steps based on available features and DOM elements
export const getAvailableTourSteps = (
  stepData: TourStepData[] = ONBOARDING_TOUR_STEPS,
  availableFeatures: string[] = [],
  checkDOMElements: boolean = true
): TourStep[] => {
  let filteredSteps = stepData.filter((step) => {
    // If step has required features, check if they're available
    if (step.requiredFeatures && step.requiredFeatures.length > 0) {
      const hasRequiredFeatures = step.requiredFeatures.every((feature) =>
        availableFeatures.includes(feature)
      )
      if (!hasRequiredFeatures) {
        return false
      }
    }
    return true
  })

  // Check if target elements exist in DOM (optional)
  if (checkDOMElements) {
    const elementExistence = checkTargetElementsExist(filteredSteps)
    filteredSteps = filteredSteps.filter((step) => {
      const exists = elementExistence[step.id]
      if (!exists) {
        console.warn(
          `Skipping tour step "${step.id}" - target element not found: ${step.target}`
        )
      }
      return exists
    })
  }

  return convertToJoyrideSteps(filteredSteps)
}

// Get tour steps by category
export const getTourStepsByCategory = (
  category: 'onboarding' | 'settings'
): TourStepData[] => {
  switch (category) {
    case 'onboarding':
      return ONBOARDING_TOUR_STEPS
    case 'settings':
      return SETTINGS_TOUR_STEPS
    default:
      console.warn(`Unknown tour category: ${category}`)
      return []
  }
}

// Create a custom tour step configuration
export const createCustomTourStep = (
  id: string,
  target: string,
  title: string,
  content: string,
  options: Partial<
    Omit<TourStepData, 'id' | 'target' | 'title' | 'content'>
  > = {}
): TourStepData => {
  const step: TourStepData = {
    id,
    target,
    title,
    content,
    placement: options.placement ?? 'bottom',
    order: options.order ?? 1,
    isOptional: options.isOptional ?? false,
    requiredFeatures: options.requiredFeatures,
    disableBeacon: options.disableBeacon,
    hideCloseButton: options.hideCloseButton,
    hideFooter: options.hideFooter,
    styles: options.styles,
  }

  // Validate the created step
  const validation = validateTourStep(step)
  if (!validation.isValid) {
    console.error(`Invalid tour step created: ${id}`, validation.errors)
  }

  return step
}

// Responsive positioning utility
export const getResponsiveTourConfig = () => {
  const isMobile = window.innerWidth < 768 // md breakpoint
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024 // lg breakpoint

  return {
    scrollOffset: isMobile ? 80 : 20, // Account for mobile header/footer
    styles: {
      options: {
        width: isMobile
          ? Math.min(window.innerWidth - 32, 320)
          : isTablet
            ? 350
            : 380,
        zIndex: 10000,
      },
      tooltip: {
        borderRadius: '12px',
        padding: isMobile ? '16px' : '20px',
      },
    },
  }
}

// Handle dynamic content loading states
export const waitForElement = (
  selector: string,
  timeout: number = 5000
): Promise<Element | null> => {
  return new Promise((resolve) => {
    const element = document.querySelector(selector)
    if (element) {
      resolve(element)
      return
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector)
      if (element) {
        observer.disconnect()
        resolve(element)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    // Timeout fallback
    setTimeout(() => {
      observer.disconnect()
      resolve(null)
    }, timeout)
  })
}

// Default tour configuration
export const DEFAULT_TOUR_CONFIG = {
  continuous: true,
  showProgress: false, // Disable built-in progress to use custom
  showSkipButton: true,
  spotlightClicks: true,
  disableOverlayClose: false,
  disableScrollParentFix: false,
  hideBackButton: false,
  scrollToFirstStep: true,
  scrollOffset: 20,
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
    // Override progress display to use 1-based indexing
    tooltipFooter: {
      marginTop: '16px',
    },
  },
  locale: {
    back: 'Back',
    close: 'Close',
    last: 'Finish',
    next: 'Next',
    skip: 'Skip tour',
  },
  floaterProps: {
    disableAnimation: false,
  },
}

export type { TourStep }
