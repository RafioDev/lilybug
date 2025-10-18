import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Mic,
  MicOff,
  Send,
  X,
  Minimize2,
  Maximize2,
  Sparkles,
} from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Input } from './Input'
import { IconButton } from './Button'
import { chatActionService } from '../services/chatActionService'
import { smartSearchService } from '../services/smartSearchService'
import { useActiveBaby } from '../hooks/queries/useBabyQueries'
import { useEntries } from '../hooks/queries/useTrackerQueries'

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

interface AIMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  isVoice?: boolean
}

interface FloatingAIAssistantProps {
  onEntryCreated?: () => void
}

export const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({
  onEntryCreated,
}) => {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Don't show on AI home page - but keep hooks consistent
  const shouldShow = location.pathname !== '/'

  // Use React Query for data - only fetch when component should show and is open
  const { data: activeBaby } = useActiveBaby()
  const { data: entries = [] } = useEntries(100, activeBaby?.id)

  const processMessage = useCallback(
    async (message: string) => {
      setIsProcessing(true)

      try {
        const babyName = activeBaby?.name || 'your baby'
        const action = await chatActionService.parseActionFromMessage(
          message,
          babyName
        )

        let responseContent = ''

        if (action.type === 'create_entry') {
          if (!activeBaby) {
            responseContent =
              'Please add a baby first before tracking activities.'
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

          responseContent = `I can't start live timers, but I can log completed feedings! Try saying "Log a ${feedingTypeText} feeding of 120ml" or just "Log ${feedingTypeText} feeding".`
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
              responseContent = `I couldn't find any ${
                parsedQuery.type === 'all' ? 'activities' : parsedQuery.type
              } matching "${message}". ${babyName} might not have had any activities matching those criteria yet.`
            } else {
              responseContent = `Looking at ${babyName}'s data: ${searchResult.summary}`
            }
          } catch (error) {
            console.error('Error generating response:', error)
            responseContent = `I can help you track ${babyName}'s activities! Try saying things like "Log a bottle feeding of 120ml" or "How did ${babyName.toLowerCase()} sleep last night?"`
          }
        }

        const assistantMessage: AIMessage = {
          id: Date.now().toString() + '_assistant',
          type: 'assistant',
          content: responseContent,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
      } catch (error) {
        console.error('Error processing message:', error)

        const errorMessage: AIMessage = {
          id: Date.now().toString() + '_error',
          type: 'assistant',
          content:
            "I'm sorry, I had trouble with that request. Could you try again?",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsProcessing(false)
      }
    },
    [activeBaby, entries, onEntryCreated]
  )

  const handleVoiceInput = useCallback(
    async (transcript: string) => {
      const userMessage: AIMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: transcript,
        timestamp: new Date(),
        isVoice: true,
      }

      setMessages((prev) => [...prev, userMessage])
      await processMessage(transcript)
    },
    [processMessage]
  )

  useEffect(() => {
    if (isOpen) {
      // Initialize speech recognition
      if (window.webkitSpeechRecognition || window.SpeechRecognition) {
        const SpeechRecognitionClass =
          window.webkitSpeechRecognition || window.SpeechRecognition
        if (SpeechRecognitionClass) {
          recognitionRef.current = new SpeechRecognitionClass()

          recognitionRef.current.continuous = false
          recognitionRef.current.interimResults = false
          recognitionRef.current.lang = 'en-US'

          recognitionRef.current.onstart = () => {
            setIsListening(true)
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
          }

          recognitionRef.current.onend = () => {
            setIsListening(false)
          }
        }
      }

      // Add welcome message when first opened
      if (messages.length === 0) {
        const welcomeMessage: AIMessage = {
          id: 'welcome',
          type: 'assistant',
          content: `Hi! I'm your assistant. Just tap the mic and say something like "Log a bottle feeding of 4 ounces" to quickly track activities!`,
          timestamp: new Date(),
        }
        setMessages([welcomeMessage])
      }
    }
  }, [isOpen, handleVoiceInput, messages.length])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleTextInput = async () => {
    if (!inputText.trim()) return

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date(),
      isVoice: false,
    }

    setMessages((prev) => [...prev, userMessage])
    const message = inputText
    setInputText('')
    await processMessage(message)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Don't render if not on a page that should show the assistant
  if (!shouldShow) {
    return null
  }

  // Floating action button when closed
  if (!isOpen) {
    return (
      <div className='fixed right-6 bottom-24 z-50 lg:bottom-6'>
        <IconButton
          icon={<Sparkles className='h-6 w-6' />}
          onClick={() => setIsOpen(true)}
          variant='primary'
          size='lg'
          fullRounded
          aria-label='Open AI Assistant'
          className='h-14 w-14 bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg hover:scale-105 hover:shadow-xl'
        />
      </div>
    )
  }

  return (
    <div
      className={`fixed right-6 bottom-24 z-50 transition-all duration-200 lg:bottom-6 ${
        isMinimized ? 'h-16 w-80' : 'h-96 w-80'
      }`}
    >
      <div className='flex h-full flex-col rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800'>
        {/* Header */}
        <div className='flex items-center justify-between rounded-t-lg border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white dark:border-gray-700'>
          <div className='flex items-center gap-2'>
            <Sparkles className='h-5 w-5' />
            <span className='text-sm font-medium'>Assistant</span>
          </div>
          <div className='flex items-center gap-1'>
            <IconButton
              icon={
                isMinimized ? (
                  <Maximize2 className='h-4 w-4' />
                ) : (
                  <Minimize2 className='h-4 w-4' />
                )
              }
              onClick={() => setIsMinimized(!isMinimized)}
              variant='primary'
              size='sm'
              aria-label={
                isMinimized ? 'Maximize assistant' : 'Minimize assistant'
              }
              className='min-h-auto min-w-auto border-none bg-transparent p-1 shadow-none hover:bg-white/20'
            />
            <IconButton
              icon={<X className='h-4 w-4' />}
              onClick={() => setIsOpen(false)}
              variant='primary'
              size='sm'
              aria-label='Close assistant'
              className='min-h-auto min-w-auto border-none bg-transparent p-1 shadow-none hover:bg-white/20'
            />
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className='flex-1 space-y-3 overflow-y-auto bg-white p-3 dark:bg-gray-800'>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-2 text-sm ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                    }`}
                  >
                    <p className='whitespace-pre-line'>{message.content}</p>
                    <div
                      className={`mt-1 text-xs ${
                        message.type === 'user'
                          ? 'text-blue-100'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {message.isVoice && '🎤 '}
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}

              {isProcessing && (
                <div className='flex justify-start'>
                  <div className='rounded-lg bg-gray-100 p-2 text-gray-900 dark:bg-gray-700 dark:text-gray-100'>
                    <div className='flex space-x-1'>
                      <div className='h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500'></div>
                      <div
                        className='h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500'
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className='h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500'
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className='border-t border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800'>
              <div className='mb-2 flex gap-2'>
                <Input
                  type='text'
                  value={inputText}
                  onChange={setInputText}
                  placeholder='Or type here...'
                  className='flex-1 text-sm'
                />

                <IconButton
                  icon={<Send className='h-4 w-4' />}
                  onClick={handleTextInput}
                  disabled={!inputText.trim() || isProcessing}
                  variant='primary'
                  size='sm'
                  fullRounded
                  aria-label='Send message'
                  className='flex-shrink-0 p-2'
                />

                <IconButton
                  icon={
                    isListening ? (
                      <MicOff className='h-4 w-4' />
                    ) : (
                      <Mic className='h-4 w-4' />
                    )
                  }
                  onClick={isListening ? stopListening : startListening}
                  disabled={isProcessing}
                  variant={isListening ? 'danger' : 'primary'}
                  size='sm'
                  fullRounded
                  aria-label={
                    isListening ? 'Stop listening' : 'Start voice input'
                  }
                  className={`flex-shrink-0 p-2 ${
                    isListening ? 'animate-pulse' : ''
                  }`}
                />
              </div>

              {isListening && (
                <div className='animate-pulse text-center text-xs text-blue-600 dark:text-blue-400'>
                  🎤 Listening... Speak now!
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
