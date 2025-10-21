import React, { useState, useEffect } from 'react'
import { Mic, MicOff, Plus, Sparkles } from 'lucide-react'
import { Button } from './Button'
import { ComponentErrorBoundary } from './ComponentErrorBoundary'
import { useVoiceProcessor, VoiceState } from '../hooks/useVoiceProcessor'
import { cn } from '../utils/cn'

// Component interfaces
interface UnifiedActionFooterProps {
  onEntryCreated?: () => void
  onManualEntry?: () => void
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
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  voiceState,
  onVoiceClick,
  onManualEntry,
}) => {
  const { isListening, isProcessing } = voiceState

  return (
    <div className='fixed right-0 bottom-0 left-0 z-40 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'>
      {/* Safe area padding and proper spacing */}
      <div className='pb-safe-area-inset-bottom px-4 pt-4 pb-4'>
        <div className='mx-auto flex max-w-md gap-3'>
          {/* Voice Assistant Button - Primary action */}
          <Button
            onClick={onVoiceClick}
            variant={isListening ? 'danger' : 'primary'}
            size='lg'
            fullWidth
            disabled={isProcessing}
            className={cn(
              'flex h-14 items-center justify-center gap-2 font-medium',
              isListening && 'animate-pulse'
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
              {isListening ? 'Stop' : isProcessing ? 'Processing...' : 'Voice'}
            </span>
          </Button>

          {/* Manual Entry Button - Secondary action */}
          <Button
            onClick={onManualEntry}
            variant='outline'
            size='lg'
            fullWidth
            disabled={isListening || isProcessing}
            className='flex h-14 items-center justify-center gap-2 font-medium'
            aria-label='Open manual entry form'
          >
            <Plus className='h-5 w-5' />
            <span className='font-medium'>Manual</span>
          </Button>
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
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  voiceState,
  onVoiceClick,
  onManualEntry,
}) => {
  const { isListening, isProcessing } = voiceState

  return (
    <div className='fixed right-6 bottom-6 z-40'>
      <div className='flex flex-col gap-3'>
        {/* Voice Assistant Button - Primary action */}
        <Button
          onClick={onVoiceClick}
          variant={isListening ? 'danger' : 'primary'}
          size='lg'
          disabled={isProcessing}
          fullRounded
          className={cn(
            'group flex h-14 w-14 items-center justify-center shadow-lg transition-all duration-200',
            'hover:scale-110 hover:shadow-xl focus:scale-110 focus:shadow-xl',
            isListening && 'animate-pulse ring-2 ring-red-500 ring-offset-2'
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
            <MicOff className='h-6 w-6 transition-transform group-hover:scale-110' />
          ) : isProcessing ? (
            <div className='animate-spin'>
              <Sparkles className='h-6 w-6' />
            </div>
          ) : (
            <Mic className='h-6 w-6 transition-transform group-hover:scale-110' />
          )}
        </Button>

        {/* Manual Entry Button - Secondary action */}
        <Button
          onClick={onManualEntry}
          variant='outline'
          size='lg'
          disabled={isListening || isProcessing}
          fullRounded
          className={cn(
            'group flex h-12 w-12 items-center justify-center shadow-lg transition-all duration-200',
            'hover:scale-110 hover:shadow-xl focus:scale-110 focus:shadow-xl',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-lg'
          )}
          aria-label='Open manual entry form'
        >
          <Plus className='h-5 w-5 transition-transform group-hover:scale-110' />
        </Button>
      </div>
    </div>
  )
}

// Main component
export const UnifiedActionFooter: React.FC<UnifiedActionFooterProps> = ({
  onEntryCreated,
  onManualEntry,
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

  // Don't render if speech recognition is not supported
  if (!isSupported) {
    return null
  }

  return (
    <ComponentErrorBoundary
      componentName='UnifiedActionFooter'
      contextData={{}}
    >
      <div className={cn('relative', className)}>
        {/* Feedback overlay */}
        <FeedbackOverlay voiceState={voiceState} layout={layout} />

        {/* Layout variants */}
        {layout.isMobile ? (
          <MobileLayout
            voiceState={voiceState}
            onVoiceClick={handleVoiceClick}
            onManualEntry={onManualEntry}
          />
        ) : (
          <DesktopLayout
            voiceState={voiceState}
            onVoiceClick={handleVoiceClick}
            onManualEntry={onManualEntry}
          />
        )}
      </div>
    </ComponentErrorBoundary>
  )
}
