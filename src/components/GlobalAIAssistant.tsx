import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  MessageCircle,
  Mic,
  MicOff,
  Send,
  X,
  Minimize2,
  Maximize2,
} from 'lucide-react'

import { Input } from './Input'
import { IconButton } from './Button'
import { chatActionService } from '../services/chatActionService'
import { smartSearchService } from '../services/smartSearchService'
import { trackerService } from '../services/trackerService'
import { babyService } from '../services/babyService'
import type { TrackerEntry, Baby } from '../types'

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

interface GlobalAIAssistantProps {
  onEntryCreated?: () => void // Callback to refresh data on parent pages
}

export const GlobalAIAssistant: React.FC<GlobalAIAssistantProps> = ({
  onEntryCreated,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeBaby, setActiveBaby] = useState<Baby | null>(null)
  const [entries, setEntries] = useState<TrackerEntry[]>([])

  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const processMessage = useCallback(
    async (message: string) => {
      setIsProcessing(true)

      try {
        const babyName = activeBaby?.name || 'your baby'

        // Parse the action using AI
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
            // Execute the action
            const actionResult = await chatActionService.executeAction(
              action,
              babyName,
              activeBaby.id
            )
            responseContent = actionResult

            // Refresh data
            const updatedEntries = await trackerService.getEntries(
              100,
              activeBaby.id
            )
            setEntries(updatedEntries)

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

  const loadData = useCallback(async () => {
    try {
      const activeBabyData = await babyService.getActiveBaby()
      const entriesData = await trackerService.getEntries(
        100,
        activeBabyData?.id
      )

      setActiveBaby(activeBabyData)
      setEntries(entriesData)
    } catch (error) {
      console.error('Error loading AI assistant data:', error)
    }
  }, [])

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
    loadData()
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
  }, [handleVoiceInput, loadData])

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

  // Don't render if not open
  if (!isOpen) {
    return (
      <IconButton
        icon={<MessageCircle className='h-6 w-6' />}
        onClick={() => setIsOpen(true)}
        variant='primary'
        size='lg'
        fullRounded
        aria-label='Open AI Assistant'
        className='fixed right-6 bottom-6 z-50 h-14 w-14 bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg transition-all duration-200 hover:shadow-xl'
      />
    )
  }

  return (
    <div
      className={`fixed right-6 bottom-6 z-50 transition-all duration-200 ${
        isMinimized ? 'h-16 w-80' : 'h-96 w-80'
      }`}
    >
      <div className='flex h-full flex-col rounded-lg border border-gray-200 bg-white shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between rounded-t-lg border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white'>
          <div className='flex items-center gap-2'>
            <MessageCircle className='h-5 w-5' />
            <span className='text-sm font-medium'>Assistant</span>
          </div>
          <div className='flex items-center gap-1'>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className='rounded p-1 hover:bg-white/20'
            >
              {isMinimized ? (
                <Maximize2 className='h-4 w-4' />
              ) : (
                <Minimize2 className='h-4 w-4' />
              )}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className='rounded p-1 hover:bg-white/20'
            >
              <X className='h-4 w-4' />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className='flex-1 space-y-3 overflow-y-auto p-3'>
              {messages.length === 0 && (
                <div className='py-4 text-center text-sm text-gray-500'>
                  <MessageCircle className='mx-auto mb-2 h-8 w-8 opacity-50' />
                  <p>Hi! I'm your assistant.</p>
                  <p className='mt-1 text-xs'>
                    Try saying "Log a bottle feeding" or click the mic!
                  </p>
                </div>
              )}

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
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className='whitespace-pre-line'>{message.content}</p>
                    <div
                      className={`mt-1 text-xs ${
                        message.type === 'user'
                          ? 'text-blue-100'
                          : 'text-gray-500'
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
                  <div className='rounded-lg bg-gray-100 p-2 text-gray-900'>
                    <div className='flex space-x-1'>
                      <div className='h-2 w-2 animate-bounce rounded-full bg-gray-400'></div>
                      <div
                        className='h-2 w-2 animate-bounce rounded-full bg-gray-400'
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className='h-2 w-2 animate-bounce rounded-full bg-gray-400'
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className='border-t border-gray-200 p-3'>
              <div className='flex gap-2'>
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
                  className={`${isListening ? 'animate-pulse' : ''}`}
                />

                <Input
                  type='text'
                  value={inputText}
                  onChange={setInputText}
                  placeholder='Type or speak your request...'
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
                />
              </div>

              {isListening && (
                <div className='mt-2 animate-pulse text-center text-xs text-blue-600'>
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
