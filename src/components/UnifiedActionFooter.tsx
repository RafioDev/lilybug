import React, { useState, useEffect } from 'react'
import { Mic, MicOff, Plus, Sparkles, CheckCircle } from 'lucide-react'
import { Button } from './Button'
import { ComponentErrorBoundary } from './ComponentErrorBoundary'
import { useVoiceProcessor, VoiceState } from '../hooks/useVoiceProcessor'
import { cn } from '../utils/cn'
import type { TrackerEntry } from '../types'

// Component interfaces
interface UnifiedActionFooterProps {
  onEntryCreated?: () => void
  onManualEntry?: () => void
  onStopActivity?: (entry: TrackerEntry) => void
  inProgressActivity?: TrackerEntry | null
  className?: string
}

interface LayoutVariant {
  type: 'mobile' | 'desktop'
  isMobile: boolean
  isDesktop: boolean
}

// Responsive layout detection hook
const useResponsiveLayout = (): LayoutVariant => {
  const [layout, setLayout] = useState<LayoutVariant>({
    type: 'mobile',
    isMobile: true,
    isDesktop: false,
  })

  useEffect(() => {
    const checkLayout = () => {
      const isDesktop = window.innerWidth >= 1024 // lg breakpoint
      setLayout({
        type: isDesktop ? 'desktop' : 'mobile',
        isMobile: !isDesktop,
        isDesktop,
      })
    }

    // Initial check
    checkLayout()

    // Listen for resize events
    window.addEventListener('resize', checkLayout)
    return () => window.removeEventListener('resize', checkLayout)
  }, [])

  return layout
}

// Feedback overlay component
interface FeedbackOverlayProps {
  voiceState: VoiceState
  layout: LayoutVariant
}

const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({
  voiceState,
  layout,
}) => {
  if (!voiceState.showFeedback) return null

  const { feedbackMessage, feedbackType, isProcessing } = voiceState

  // Responsive positioning based on layout
  const positionClasses = layout.isMobile
    ? 'fixed right-4 bottom-24 left-4 z-50' // Mobile: above footer with safe area
    : 'fixed bottom-6 right-6 z-50 max-w-sm' // Desktop: near corner

  return (
    <div
      className={cn(
        positionClasses,
        'transform rounded-lg p-3 shadow-lg transition-all duration-300',
        feedbackType === 'success' && 'bg-emerald-500 text-white',
        feedbackType === 'error' && 'bg-rose-500 text-white',
        feedbackType === 'info' && 'bg-blue-500 text-white',
        voiceState.showFeedback
          ? 'translate-y-0 opacity-100'
          : 'translate-y-2 opacity-0'
      )}
    >
      <div className='flex items-start gap-2'>
        {feedbackType === 'success' && (
          <Sparkles className='mt-0.5 h-4 w-4 flex-shrink-0' />
        )}
        {feedbackType === 'error' && (
          <Mic className='mt-0.5 h-4 w-4 flex-shrink-0' />
        )}
        {feedbackType === 'info' && (
          <Mic className='mt-0.5 h-4 w-4 flex-shrink-0' />
        )}
        <p className='text-sm leading-relaxed'>{feedbackMessage}</p>
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className='mt-2 flex justify-center'>
          <div className='flex space-x-1'>
            <div className='h-2 w-2 animate-bounce rounded-full bg-white/60'></div>
            <div
              className='h-2 w-2 animate-bounce rounded-full bg-white/60'
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className='h-2 w-2 animate-bounce rounded-full bg-white/60'
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        </div>
      )}
    </div>
  )
}

// Mobile layout component
interface MobileLayoutProps {
  voiceState: VoiceState
  onVoiceClick: () => void
  onManualEntry?: () => void
  onStopActivity?: (entry: TrackerEntry) => void
  inProgressActivity?: TrackerEntry | null
  isSupported: boolean
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  voiceState,
  onVoiceClick,
  onManualEntry,
  onStopActivity,
  inProgressActivity,
  isSupported,
}) => {
  const { isListening, isProcessing } = voiceState

  return (
    <div className='fixed right-0 bottom-0 left-0 z-40 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'>
      {/* Safe area padding and proper spacing */}
      <div className='pb-safe-area-inset-bottom px-4 pt-4 pb-4'>
        <div className='relative mx-auto max-w-md'>
          {/* Normal buttons - always rendered */}
          <div className='flex gap-3' data-tour='activity-buttons'>
            {/* Voice Assistant Button - Purple outline */}
            <Button
              onClick={onVoiceClick}
              variant='outline'
              size='lg'
              fullWidth
              disabled={isProcessing || !isSupported}
              data-tour='voice-button'
              className={cn(
                'flex h-14 transform items-center justify-center gap-2 border-2 font-medium shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl',
                isListening
                  ? 'animate-pulse border-red-500 text-red-600 hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-950'
                  : 'border-purple-500 text-purple-600 hover:border-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:border-purple-300 dark:hover:bg-purple-950'
              )}
              aria-label={
                isListening
                  ? 'Stop voice input'
                  : isProcessing
                    ? 'Processing voice input'
                    : 'Start voice input'
              }
            >
              {isListening ? (
                <MicOff className='h-5 w-5' />
              ) : isProcessing ? (
                <div className='animate-spin'>
                  <Sparkles className='h-5 w-5' />
                </div>
              ) : (
                <Mic className='h-5 w-5' />
              )}
              <span className='font-medium'>
                {isListening
                  ? 'Stop'
                  : isProcessing
                    ? 'Processing...'
                    : 'Voice'}
              </span>
            </Button>

            {/* New Entry Button - Blue outline */}
            <Button
              onClick={onManualEntry}
              variant='outline'
              size='lg'
              fullWidth
              disabled={isListening || isProcessing}
              data-tour='new-entry-button'
              className='flex h-14 transform items-center justify-center gap-2 border-2 border-blue-500 font-medium text-blue-600 shadow-lg transition-all duration-200 hover:scale-105 hover:border-blue-600 hover:bg-blue-50 hover:shadow-xl'
              aria-label='Open manual entry form'
            >
              <Plus className='h-5 w-5' />
              <span className='font-medium'>New</span>
            </Button>
          </div>

          {/* Mark Complete overlay - only when in-progress activity exists */}
          {inProgressActivity && onStopActivity && (
            <div className='absolute inset-0 flex items-center justify-center'>
              <Button
                onClick={() => onStopActivity(inProgressActivity)}
                variant='outline'
                size='lg'
                fullWidth
                leftIcon={<CheckCircle className='h-5 w-5' />}
                className='h-14 border-2 border-orange-500 bg-white font-medium text-orange-600 shadow-lg transition-all duration-200 hover:scale-105 hover:border-orange-600 hover:bg-orange-50 hover:shadow-xl dark:border-orange-400 dark:bg-gray-800 dark:text-orange-400 dark:hover:border-orange-300 dark:hover:bg-orange-950'
                aria-label={`Complete ${inProgressActivity.entry_type} activity`}
              >
                Mark Complete
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Desktop layout component
interface DesktopLayoutProps {
  voiceState: VoiceState
  onVoiceClick: () => void
  onManualEntry?: () => void
  onStopActivity?: (entry: TrackerEntry) => void
  inProgressActivity?: TrackerEntry | null
  isSupported: boolean
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  voiceState,
  onVoiceClick,
  onManualEntry,
  onStopActivity,
  inProgressActivity,
  isSupported,
}) => {
  const { isListening, isProcessing } = voiceState

  return (
    <div className='fixed right-0 bottom-6 left-0 z-40 flex justify-center'>
      <div className='relative'>
        {/* Normal buttons - hidden when overlay is active */}
        <div
          className={cn(
            'flex gap-4',
            inProgressActivity && onStopActivity && 'hidden'
          )}
          data-tour='activity-buttons'
        >
          {/* Voice Assistant Button - Purple outline */}
          <Button
            onClick={onVoiceClick}
            variant='outline'
            size='lg'
            disabled={isProcessing || !isSupported}
            data-tour='voice-button'
            className={cn(
              'group flex h-14 items-center justify-center gap-3 border-2 px-6 shadow-lg transition-all duration-200',
              'hover:scale-105 hover:shadow-xl focus:scale-105 focus:shadow-xl',
              isListening
                ? 'animate-pulse border-red-500 text-red-600 ring-2 ring-red-500 ring-offset-2 hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-950'
                : 'border-purple-500 text-purple-600 hover:border-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:border-purple-300 dark:hover:bg-purple-950'
            )}
            aria-label={
              isListening
                ? 'Stop voice input'
                : isProcessing
                  ? 'Processing voice input'
                  : 'Start voice input'
            }
          >
            {isListening ? (
              <MicOff className='h-5 w-5 transition-transform group-hover:scale-110' />
            ) : isProcessing ? (
              <div className='animate-spin'>
                <Sparkles className='h-5 w-5' />
              </div>
            ) : (
              <Mic className='h-5 w-5 transition-transform group-hover:scale-110' />
            )}
            <span className='font-medium'>
              {isListening
                ? 'Stop Recording'
                : isProcessing
                  ? 'Processing...'
                  : 'Voice Assistant'}
            </span>
          </Button>

          {/* New Entry Button - Blue outline */}
          <Button
            onClick={onManualEntry}
            variant='outline'
            size='lg'
            disabled={isListening || isProcessing}
            data-tour='new-entry-button'
            className={cn(
              'group flex h-14 items-center justify-center gap-3 border-2 border-blue-500 px-6 text-blue-600 shadow-lg transition-all duration-200',
              'hover:scale-105 hover:border-blue-600 hover:bg-blue-50 hover:shadow-xl focus:scale-105 focus:shadow-xl',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-lg'
            )}
            aria-label='Open manual entry form'
          >
            <Plus className='h-5 w-5 transition-transform group-hover:scale-110' />
            <span className='font-medium'>New Entry</span>
          </Button>
        </div>

        {/* Mark Complete button - only when in-progress activity exists */}
        {inProgressActivity && onStopActivity && (
          <div className='flex items-center justify-center'>
            <Button
              onClick={() => onStopActivity(inProgressActivity)}
              variant='outline'
              size='lg'
              leftIcon={<CheckCircle className='h-5 w-5' />}
              className='h-14 border-2 border-orange-500 bg-white px-6 text-orange-600 shadow-lg transition-all duration-200 hover:scale-105 hover:border-orange-600 hover:bg-orange-50 hover:shadow-xl focus:scale-105 focus:shadow-xl dark:border-orange-400 dark:bg-gray-800 dark:text-orange-400 dark:hover:border-orange-300 dark:hover:bg-orange-950'
              aria-label={`Complete ${inProgressActivity.entry_type} activity`}
            >
              Mark Complete
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Main component
export const UnifiedActionFooter: React.FC<UnifiedActionFooterProps> = ({
  onEntryCreated,
  onManualEntry,
  onStopActivity,
  inProgressActivity,
  className = '',
}) => {
  const layout = useResponsiveLayout()
  const { voiceState, startListening, stopListening, isSupported } =
    useVoiceProcessor(onEntryCreated)

  // Handle voice button click
  const handleVoiceClick = () => {
    if (!isSupported) {
      console.warn('Speech recognition not supported in this browser')
      return
    }

    if (voiceState.isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  // Note: We still render the footer even if speech recognition is not supported
  // The voice button will be disabled, but the New Entry button should still work

  return (
    <ComponentErrorBoundary
      componentName='UnifiedActionFooter'
      contextData={{}}
    >
      <div className={cn('relative', className)} data-tour='activity-footer'>
        {/* Feedback overlay */}
        <FeedbackOverlay voiceState={voiceState} layout={layout} />

        {/* Layout variants */}
        {layout.isMobile ? (
          <MobileLayout
            voiceState={voiceState}
            onVoiceClick={handleVoiceClick}
            onManualEntry={onManualEntry}
            onStopActivity={onStopActivity}
            inProgressActivity={inProgressActivity}
            isSupported={isSupported}
          />
        ) : (
          <DesktopLayout
            voiceState={voiceState}
            onVoiceClick={handleVoiceClick}
            onManualEntry={onManualEntry}
            onStopActivity={onStopActivity}
            inProgressActivity={inProgressActivity}
            isSupported={isSupported}
          />
        )}
      </div>
    </ComponentErrorBoundary>
  )
}
