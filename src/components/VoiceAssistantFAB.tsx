import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, MicOff, Sparkles, MessageCircle } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { ExpandableFAB } from './ExpandableFAB'
import { createDefaultQuickActions } from './fabUtils'
import { ComponentErrorBoundary } from './ComponentErrorBoundary'
import { chatActionService } from '../services/chatActionService'
import { smartSearchService } from '../services/smartSearchService'
import { useActiveBaby } from '../hooks/queries/useBabyQueries'
import { useEntries } from '../hooks/queries/useTrackerQueries'
import { cn } from '../utils/cn'
import type {
  EntryType,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
  SpeechRecognitionInterface,
} from '../types'

interface VoiceAssistantFABProps {
  onEntryCreated?: () => void
  onQuickEntry?: (entryType: EntryType) => void
  position?: {
    bottom?: string
    right?: string
    left?: string
    top?: string
  }
  className?: string
}

export const VoiceAssistantFAB: React.FC<VoiceAssistantFABProps> = ({
  onEntryCreated,
  onQuickEntry,
  position = { bottom: '1.5rem', right: '1.5rem' },
  className = '',
}) => {
  const location = useLocation()
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackType, setFeedbackType] = useState<
    'success' | 'error' | 'info'
  >('info')

  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null)
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Show on Activities page (which is the root path)
  const shouldShow = location.pathname === '/'

  // Use React Query for data
  const { data: activeBaby } = useActiveBaby()
  const { data: entries = [] } = useEntries(100, activeBaby?.id)

  // Process voice message
  const processMessage = useCallback(
    async (message: string) => {
      setIsProcessing(true)
      setShowFeedback(true)
      setFeedbackMessage('Processing...')
      setFeedbackType('info')

      try {
        const babyName = activeBaby?.name || 'your baby'
        const action = await chatActionService.parseActionFromMessage(
          message,
          babyName
        )

        let responseContent = ''
        let responseType: 'success' | 'error' | 'info' = 'success'

        if (action.type === 'create_entry') {
          if (!activeBaby) {
            responseContent =
              'Please add a baby first before tracking activities.'
            responseType = 'error'
          } else {
            const actionResult = await chatActionService.executeAction(
              action,
              babyName,
              activeBaby.id
            )
            responseContent = actionResult

            // Notify parent component
            if (onEntryCreated) {
              onEntryCreated()
            }
          }
        } else if (action.type === 'start_timer') {
          const feedingTypeText =
            action.feedingType === 'breast_left'
              ? 'left breast'
              : action.feedingType === 'breast_right'
                ? 'right breast'
                : action.feedingType === 'both'
                  ? 'both breasts'
                  : 'bottle'

          responseContent = `I can't start live timers, but I can log completed feedings! Try saying "Log a ${feedingTypeText} feeding of 120ml"`
          responseType = 'info'
        } else {
          // Handle as search query
          try {
            const parsedQuery =
              smartSearchService.parseNaturalLanguageQuery(message)
            const searchResult = smartSearchService.executeSearch(
              entries,
              parsedQuery
            )

            if (searchResult.totalCount === 0) {
              responseContent = `No ${
                parsedQuery.type === 'all' ? 'activities' : parsedQuery.type
              } found matching "${message}"`
              responseType = 'info'
            } else {
              responseContent = searchResult.summary
              responseType = 'success'
            }
          } catch (error) {
            console.error('Error generating response:', error)
            responseContent = `Try saying "Log a bottle feeding of 120ml" or "How did ${babyName.toLowerCase()} sleep last night?"`
            responseType = 'info'
          }
        }

        setFeedbackMessage(responseContent)
        setFeedbackType(responseType)

        // Auto-hide feedback after 4 seconds
        if (feedbackTimeoutRef.current) {
          clearTimeout(feedbackTimeoutRef.current)
        }
        feedbackTimeoutRef.current = setTimeout(() => {
          setShowFeedback(false)
        }, 4000)
      } catch (error) {
        console.error('Error processing message:', error)
        setFeedbackMessage(
          'Sorry, I had trouble with that request. Could you try again?'
        )
        setFeedbackType('error')

        // Auto-hide error after 3 seconds
        if (feedbackTimeoutRef.current) {
          clearTimeout(feedbackTimeoutRef.current)
        }
        feedbackTimeoutRef.current = setTimeout(() => {
          setShowFeedback(false)
        }, 3000)
      } finally {
        setIsProcessing(false)
      }
    },
    [activeBaby, entries, onEntryCreated]
  )

  // Handle voice input
  const handleVoiceInput = useCallback(
    async (transcript: string) => {
      await processMessage(transcript)
    },
    [processMessage]
  )

  // Initialize speech recognition
  useEffect(() => {
    if (
      shouldShow &&
      (window.webkitSpeechRecognition || window.SpeechRecognition)
    ) {
      const SpeechRecognitionClass =
        window.webkitSpeechRecognition || window.SpeechRecognition
      if (SpeechRecognitionClass) {
        recognitionRef.current = new SpeechRecognitionClass()

        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onstart = () => {
          setIsListening(true)
          setShowFeedback(true)
          setFeedbackMessage('🎤 Listening... Speak now!')
          setFeedbackType('info')
        }

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript
          handleVoiceInput(transcript)
        }

        recognitionRef.current.onerror = (
          event: SpeechRecognitionErrorEvent
        ) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          setFeedbackMessage('Voice recognition error. Please try again.')
          setFeedbackType('error')

          // Auto-hide error after 3 seconds
          if (feedbackTimeoutRef.current) {
            clearTimeout(feedbackTimeoutRef.current)
          }
          feedbackTimeoutRef.current = setTimeout(() => {
            setShowFeedback(false)
          }, 3000)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }

    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current)
      }
    }
  }, [shouldShow, handleVoiceInput])

  // Voice control functions
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening && !isProcessing) {
      recognitionRef.current.start()
    }
  }, [isListening, isProcessing])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  // Handle quick entry actions
  const handleQuickEntry = useCallback(
    (entryType: EntryType) => {
      if (onQuickEntry) {
        onQuickEntry(entryType)
      }
    },
    [onQuickEntry]
  )

  // Create quick actions
  const quickActions = createDefaultQuickActions(
    () => handleQuickEntry('feeding'),
    () => handleQuickEntry('diaper'),
    () => handleQuickEntry('sleep')
  )

  // Handle primary FAB action (voice activation)
  const handlePrimaryAction = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  // Don't render if not on a page that should show the assistant
  if (!shouldShow) {
    return null
  }

  return (
    <ComponentErrorBoundary
      componentName='VoiceAssistantFAB'
      contextData={{
        babyId: activeBaby?.id,
      }}
    >
      <div className={cn('relative', className)}>
        {/* Feedback overlay */}
        {showFeedback && (
          <div
            className={cn(
              'fixed right-6 bottom-20 left-6 z-40 transform rounded-lg p-3 shadow-lg transition-all duration-300 md:right-6 md:left-auto md:w-80',
              feedbackType === 'success' && 'bg-emerald-500 text-white',
              feedbackType === 'error' && 'bg-rose-500 text-white',
              feedbackType === 'info' && 'bg-blue-500 text-white',
              showFeedback
                ? 'translate-y-0 opacity-100'
                : 'translate-y-2 opacity-0'
            )}
          >
            <div className='flex items-start gap-2'>
              {feedbackType === 'success' && (
                <Sparkles className='mt-0.5 h-4 w-4 flex-shrink-0' />
              )}
              {feedbackType === 'error' && (
                <MessageCircle className='mt-0.5 h-4 w-4 flex-shrink-0' />
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
        )}

        {/* Main FAB System */}
        <ExpandableFAB
          primaryIcon={
            isListening ? (
              <MicOff className='h-6 w-6' />
            ) : isProcessing ? (
              <div className='animate-spin'>
                <Sparkles className='h-6 w-6' />
              </div>
            ) : (
              <Mic className='h-6 w-6' />
            )
          }
          primaryLabel={
            isListening
              ? 'Stop listening'
              : isProcessing
                ? 'Processing...'
                : 'Voice Assistant'
          }
          onPrimaryAction={handlePrimaryAction}
          quickActions={quickActions}
          position={position}
          className={cn(
            'transition-all duration-300',
            isListening && 'animate-pulse',
            className
          )}
          aria-label='Voice Assistant and Quick Actions'
        />
      </div>
    </ComponentErrorBoundary>
  )
}

export default VoiceAssistantFAB
