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
import { chatActionService } from '../services/chatActionService'
import { smartSearchService } from '../services/smartSearchService'
import { trackerService } from '../services/trackerService'
import { profileService } from '../services/profileService'
import type { TrackerEntry, Profile } from '../types'

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
  const [profile, setProfile] = useState<Profile | null>(null)
  const [entries, setEntries] = useState<TrackerEntry[]>([])

  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const processMessage = useCallback(
    async (message: string) => {
      setIsProcessing(true)

      try {
        const babyName = profile?.baby_name || 'your baby'

        // Parse the action
        const action = chatActionService.parseActionFromMessage(message)

        let responseContent = ''

        if (action.type === 'create_entry') {
          // Execute the action
          const actionResult = await chatActionService.executeAction(
            action,
            babyName
          )
          responseContent = actionResult

          // Refresh data
          const updatedEntries = await trackerService.getEntries(100)
          setEntries(updatedEntries)

          // Notify parent component
          if (onEntryCreated) {
            onEntryCreated()
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
            const parsedQuery = smartSearchService.parseNaturalLanguageQuery(
              message,
              profile || undefined
            )
            const searchResult = smartSearchService.executeSearch(
              entries,
              parsedQuery,
              profile || undefined
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
    [profile, entries, onEntryCreated]
  )

  const loadData = useCallback(async () => {
    try {
      const [profileData, entriesData] = await Promise.all([
        profileService.getProfile(),
        trackerService.getEntries(100),
      ])
      setProfile(profileData)
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
      <button
        onClick={() => setIsOpen(true)}
        className='fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50'
      >
        <MessageCircle className='w-6 h-6' />
      </button>
    )
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-200 ${
        isMinimized ? 'w-80 h-16' : 'w-80 h-96'
      }`}
    >
      <div className='bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col h-full'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg'>
          <div className='flex items-center gap-2'>
            <MessageCircle className='w-5 h-5' />
            <span className='font-medium text-sm'>AI Assistant</span>
          </div>
          <div className='flex items-center gap-1'>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className='p-1 hover:bg-white/20 rounded'
            >
              {isMinimized ? (
                <Maximize2 className='w-4 h-4' />
              ) : (
                <Minimize2 className='w-4 h-4' />
              )}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className='p-1 hover:bg-white/20 rounded'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className='flex-1 overflow-y-auto p-3 space-y-3'>
              {messages.length === 0 && (
                <div className='text-center text-gray-500 text-sm py-4'>
                  <MessageCircle className='w-8 h-8 mx-auto mb-2 opacity-50' />
                  <p>Hi! I'm your AI assistant.</p>
                  <p className='text-xs mt-1'>
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
                    className={`max-w-[80%] p-2 rounded-lg text-sm ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className='whitespace-pre-line'>{message.content}</p>
                    <div
                      className={`text-xs mt-1 ${
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
                  <div className='bg-gray-100 text-gray-900 p-2 rounded-lg'>
                    <div className='flex space-x-1'>
                      <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
                      <div
                        className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className='p-3 border-t border-gray-200'>
              <div className='flex gap-2'>
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isProcessing}
                  className={`p-2 rounded-lg transition-colors ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isListening ? (
                    <MicOff className='w-4 h-4' />
                  ) : (
                    <Mic className='w-4 h-4' />
                  )}
                </button>

                <Input
                  type='text'
                  value={inputText}
                  onChange={setInputText}
                  placeholder='Type or speak your request...'
                  className='flex-1 text-sm'
                />

                <button
                  onClick={handleTextInput}
                  disabled={!inputText.trim() || isProcessing}
                  className='p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <Send className='w-4 h-4' />
                </button>
              </div>

              {isListening && (
                <div className='text-center text-xs text-blue-600 mt-2 animate-pulse'>
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
