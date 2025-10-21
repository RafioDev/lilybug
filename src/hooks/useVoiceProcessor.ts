import { useState, useEffect, useRef, useCallback } from 'react'
import { chatActionService } from '../services/chatActionService'
import { smartSearchService } from '../services/smartSearchService'
import { useActiveBaby } from './queries/useBabyQueries'
import { useEntries } from './queries/useTrackerQueries'

// Speech Recognition types
interface SpeechRecognitionResult {
  transcript: string
  confidence: number
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult[]
  length: number
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent {
  error: string
}

interface SpeechRecognitionInterface {
  continuous: boolean
  interimResults: boolean
  lang: string
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognitionInterface
    SpeechRecognition?: new () => SpeechRecognitionInterface
  }
}

export interface VoiceState {
  isListening: boolean
  isProcessing: boolean
  showFeedback: boolean
  feedbackMessage: string
  feedbackType: 'success' | 'error' | 'info'
}

export interface UseVoiceProcessorReturn {
  voiceState: VoiceState
  startListening: () => void
  stopListening: () => void
  processMessage: (message: string) => Promise<void>
  isSupported: boolean
}

export const useVoiceProcessor = (
  onEntryCreated?: () => void
): UseVoiceProcessorReturn => {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    showFeedback: false,
    feedbackMessage: '',
    feedbackType: 'info',
  })

  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null)
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Use React Query for data
  const { data: activeBaby } = useActiveBaby()
  const { data: entries = [] } = useEntries(100, activeBaby?.id)

  // Check if speech recognition is supported
  const isSupported = !!(
    window.webkitSpeechRecognition || window.SpeechRecognition
  )

  // Process voice message
  const processMessage = useCallback(
    async (message: string) => {
      setVoiceState((prev) => ({
        ...prev,
        isProcessing: true,
        showFeedback: true,
        feedbackMessage: 'Processing...',
        feedbackType: 'info',
      }))

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

        setVoiceState((prev) => ({
          ...prev,
          feedbackMessage: responseContent,
          feedbackType: responseType,
        }))

        // Auto-hide feedback after appropriate timeout
        if (feedbackTimeoutRef.current) {
          clearTimeout(feedbackTimeoutRef.current)
        }
        const timeout = responseType === 'error' ? 3000 : 4000
        feedbackTimeoutRef.current = setTimeout(() => {
          setVoiceState((prev) => ({
            ...prev,
            showFeedback: false,
          }))
        }, timeout)
      } catch (error) {
        console.error('Error processing message:', error)
        setVoiceState((prev) => ({
          ...prev,
          feedbackMessage:
            'Sorry, I had trouble with that request. Could you try again?',
          feedbackType: 'error',
        }))

        // Auto-hide error after 3 seconds
        if (feedbackTimeoutRef.current) {
          clearTimeout(feedbackTimeoutRef.current)
        }
        feedbackTimeoutRef.current = setTimeout(() => {
          setVoiceState((prev) => ({
            ...prev,
            showFeedback: false,
          }))
        }, 3000)
      } finally {
        setVoiceState((prev) => ({
          ...prev,
          isProcessing: false,
        }))
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
    if (!isSupported) return

    const SpeechRecognitionClass =
      window.webkitSpeechRecognition || window.SpeechRecognition
    if (SpeechRecognitionClass) {
      recognitionRef.current = new SpeechRecognitionClass()

      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onstart = () => {
        setVoiceState((prev) => ({
          ...prev,
          isListening: true,
          showFeedback: true,
          feedbackMessage: '🎤 Listening... Speak now!',
          feedbackType: 'info',
        }))
      }

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript
        handleVoiceInput(transcript)
      }

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error)
        setVoiceState((prev) => ({
          ...prev,
          isListening: false,
          feedbackMessage: 'Voice recognition error. Please try again.',
          feedbackType: 'error',
        }))

        // Auto-hide error after 3 seconds
        if (feedbackTimeoutRef.current) {
          clearTimeout(feedbackTimeoutRef.current)
        }
        feedbackTimeoutRef.current = setTimeout(() => {
          setVoiceState((prev) => ({
            ...prev,
            showFeedback: false,
          }))
        }, 3000)
      }

      recognitionRef.current.onend = () => {
        setVoiceState((prev) => ({
          ...prev,
          isListening: false,
        }))
      }
    }

    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current)
      }
    }
  }, [handleVoiceInput, isSupported])

  // Voice control functions
  const startListening = useCallback(() => {
    if (
      recognitionRef.current &&
      !voiceState.isListening &&
      !voiceState.isProcessing &&
      isSupported
    ) {
      recognitionRef.current.start()
    }
  }, [voiceState.isListening, voiceState.isProcessing, isSupported])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && voiceState.isListening) {
      recognitionRef.current.stop()
    }
  }, [voiceState.isListening])

  return {
    voiceState,
    startListening,
    stopListening,
    processMessage,
    isSupported,
  }
}
