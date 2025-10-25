import React from 'react'
import { Play, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../ThemeToggle'
import { Button } from '../Button'
import { useTour } from '../../contexts/TourContext'
import {
  ONBOARDING_TOUR_STEPS,
  getAvailableTourSteps,
} from '../../config/tourSteps'

export const GeneralTab: React.FC = () => {
  const { startTour, hasCompletedInitialTour, endTour, getTourAnalytics } =
    useTour()
  const navigate = useNavigate()
  const tourAnalytics = getTourAnalytics()

  const handleReplayTour = () => {
    // End any existing tour first to ensure clean state
    endTour()

    // Navigate to home page where the main tour elements are located
    navigate('/')

    // Small delay to ensure navigation completes and elements are rendered
    setTimeout(() => {
      // Get available tour steps and start the tour
      const tourSteps = getAvailableTourSteps(ONBOARDING_TOUR_STEPS, [], true)
      if (tourSteps.length > 0) {
        startTour(tourSteps)
      } else {
        console.warn(
          'No tour steps available - target elements may not be present'
        )
        // Fallback: try without DOM element checking
        const fallbackSteps = getAvailableTourSteps(
          ONBOARDING_TOUR_STEPS,
          [],
          false
        )
        startTour(fallbackSteps)
      }
    }, 500)
  }

  return (
    <div>
      {/* Tab Header */}
      <div className='mb-8'>
        <h2 className='mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100'>
          General Settings
        </h2>
        <p className='text-gray-600 dark:text-gray-400'>
          Application preferences and general configuration
        </p>
      </div>

      {/* Theme Settings */}
      <div className='mb-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
        <div className='mb-4'>
          <h3 className='mb-2 text-lg font-medium text-gray-900 dark:text-gray-100'>
            Appearance
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Choose how the app looks to you. Select a single theme, or sync with
            your system and automatically switch between day and night themes.
          </p>
        </div>
        <div className='flex items-center justify-between'>
          <div>
            <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              Theme
            </label>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              Select your preferred color scheme
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Tour Settings */}
      <div className='mb-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
        <div className='mb-4'>
          <h3 className='mb-2 text-lg font-medium text-gray-900 dark:text-gray-100'>
            Guided Tour
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {hasCompletedInitialTour
              ? 'Replay the guided tour to refresh your knowledge of the app features.'
              : 'Take a guided tour to learn about the main features of Lilybug.'}
          </p>
        </div>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              App Tour
            </label>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              {hasCompletedInitialTour
                ? 'Replay the interactive walkthrough'
                : 'Start the interactive walkthrough'}
            </p>
          </div>
          <Button
            onClick={handleReplayTour}
            variant='outline'
            size='sm'
            leftIcon={
              hasCompletedInitialTour ? (
                <RotateCcw className='h-4 w-4' />
              ) : (
                <Play className='h-4 w-4' />
              )
            }
            data-tour='tour-replay'
            className='flex items-center gap-2'
          >
            {hasCompletedInitialTour ? 'Replay Tour' : 'Start Tour'}
          </Button>
        </div>

        {/* Tour Analytics */}
        {hasCompletedInitialTour && tourAnalytics.totalToursStarted > 0 && (
          <div className='border-t border-gray-200 pt-4 dark:border-gray-600'>
            <h4 className='mb-3 text-sm font-medium text-gray-700 dark:text-gray-300'>
              Tour Statistics
            </h4>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-gray-500 dark:text-gray-400'>
                  Tours Started:
                </span>
                <span className='ml-2 font-medium text-gray-900 dark:text-gray-100'>
                  {tourAnalytics.totalToursStarted}
                </span>
              </div>
              <div>
                <span className='text-gray-500 dark:text-gray-400'>
                  Tours Completed:
                </span>
                <span className='ml-2 font-medium text-gray-900 dark:text-gray-100'>
                  {tourAnalytics.totalToursCompleted}
                </span>
              </div>
              {tourAnalytics.averageCompletionTime && (
                <div className='col-span-2'>
                  <span className='text-gray-500 dark:text-gray-400'>
                    Average Time:
                  </span>
                  <span className='ml-2 font-medium text-gray-900 dark:text-gray-100'>
                    {Math.round(tourAnalytics.averageCompletionTime / 1000)}s
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
